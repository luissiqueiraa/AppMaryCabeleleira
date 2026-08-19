import { AppError } from "../utils/AppError.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  signAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
} from "../utils/token.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as authRepository from "../repositories/auth.repository.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const PASSWORD_RESET_EXPIRES_MINUTES = 15;

function toSafeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role ? { id: user.role.id, name: user.role.name } : null,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

async function issueSession(user) {
  const permissions = await authRepository.getRolePermissionKeys(user.roleId);
  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role?.name ?? null,
    permissions,
  });
  const { rawToken, tokenHash, expiresAt } = generateRefreshToken();
  await authRepository.createRefreshToken({ userId: user.id, tokenHash, expiresAt });

  return { accessToken, refreshToken: rawToken };
}

export async function register({ fullName, email, password, phoneNumber }, req) {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  const clientRole = await authRepository.findRoleByName("client");
  if (!clientRole) {
    throw new AppError("Default role is not configured", 500);
  }

  const passwordHash = await hashPassword(password);
  const user = await authRepository.createUserWithRole({
    fullName,
    email,
    passwordHash,
    phoneNumber,
    roleId: clientRole.id,
  });

  await recordAuditLog({ userId: user.id, action: "auth.register", entity: "User", entityId: user.id, req });

  return toSafeUser({ ...user, role: clientRole });
}

export async function login({ email, password }, req) {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await recordAuditLog({
      userId: user.id,
      action: "auth.login_blocked",
      entity: "User",
      entityId: user.id,
      req,
    });
    throw new AppError("Account temporarily locked due to multiple failed login attempts", 429);
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000) : null;
    await authRepository.registerFailedLoginAttempt(user.id, { attempts, lockedUntil });
    await recordAuditLog({
      userId: user.id,
      action: "auth.login_failed",
      entity: "User",
      entityId: user.id,
      req,
    });
    throw new AppError("Invalid credentials", 401);
  }

  if (user.status !== "active") {
    throw new AppError("Account is not active", 403);
  }

  await authRepository.registerSuccessfulLogin(user.id);
  const session = await issueSession(user);
  await recordAuditLog({ userId: user.id, action: "auth.login", entity: "User", entityId: user.id, req });

  return { user: toSafeUser(user), ...session };
}

export async function refresh(rawRefreshToken, req) {
  if (!rawRefreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await authRepository.findRefreshTokenByHash(tokenHash);

  if (!tokenRecord) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (tokenRecord.revokedAt) {
    // Token já rotacionado sendo reapresentado: indício de roubo/replay.
    await authRepository.revokeAllRefreshTokensForUser(tokenRecord.userId);
    await recordAuditLog({
      userId: tokenRecord.userId,
      action: "auth.refresh_token_reuse_detected",
      entity: "User",
      entityId: tokenRecord.userId,
      req,
    });
    throw new AppError("Refresh token reuse detected, all sessions were revoked", 401);
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  const user = await authRepository.findUserById(tokenRecord.userId);
  if (!user || user.status !== "active") {
    throw new AppError("Account is not active", 403);
  }

  await authRepository.revokeRefreshToken(tokenRecord.id);
  const session = await issueSession(user);

  return { user: toSafeUser(user), ...session };
}

export async function logout(rawRefreshToken, req) {
  if (!rawRefreshToken) return;

  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await authRepository.findRefreshTokenByHash(tokenHash);
  if (tokenRecord && !tokenRecord.revokedAt) {
    await authRepository.revokeRefreshToken(tokenRecord.id);
    await recordAuditLog({
      userId: tokenRecord.userId,
      action: "auth.logout",
      entity: "User",
      entityId: tokenRecord.userId,
      req,
    });
  }
}

export async function logoutAll(userId, req) {
  await authRepository.revokeAllRefreshTokensForUser(userId);
  await recordAuditLog({ userId, action: "auth.logout_all", entity: "User", entityId: userId, req });
}

export async function getMe(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const permissions = await authRepository.getRolePermissionKeys(user.roleId);
  return { ...toSafeUser(user), permissions };
}

export async function updateAvatar(userId, filename, req) {
  const avatarUrl = `/uploads/avatars/${filename}`;
  const user = await authRepository.updateUserAvatar(userId, avatarUrl);
  await recordAuditLog({ userId, action: "user.avatar_update", entity: "User", entityId: userId, req });
  const permissions = await authRepository.getRolePermissionKeys(user.roleId);
  return { ...toSafeUser(user), permissions };
}

export async function forgotPassword(email, req) {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    // Resposta genérica: não revela se o e-mail existe na base.
    return { message: "If the email exists, a reset link was generated." };
  }

  const rawToken = generateRandomToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);

  await authRepository.setPasswordResetToken(user.id, { tokenHash, expiresAt });
  await recordAuditLog({
    userId: user.id,
    action: "auth.password_reset_requested",
    entity: "User",
    entityId: user.id,
    req,
  });

  // TODO (módulo notifications): disparar e-mail real com o link de reset.
  // Sem provider de e-mail configurado ainda, o token só é exposto em dev.
  const devOnlyToken = process.env.NODE_ENV === "development" ? rawToken : undefined;

  return { message: "If the email exists, a reset link was generated.", devOnlyToken };
}

export async function resetPassword({ token, newPassword }, req) {
  const tokenHash = hashToken(token);
  const user = await authRepository.findUserByResetTokenHash(tokenHash);

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await authRepository.resetPasswordAndClearToken(user.id, passwordHash);
  await authRepository.revokeAllRefreshTokensForUser(user.id);
  await recordAuditLog({
    userId: user.id,
    action: "auth.password_reset_completed",
    entity: "User",
    entityId: user.id,
    req,
  });

  return { message: "Password updated successfully" };
}
