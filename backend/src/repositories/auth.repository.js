import { prisma } from "../config/database.js";

export function findUserByEmail(email) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { role: true },
  });
}

export function findUserById(id) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: { role: true },
  });
}

export function findRoleByName(name) {
  return prisma.role.findFirst({ where: { name, deletedAt: null } });
}

export async function getRolePermissionKeys(roleId) {
  if (!roleId) return [];
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId, deletedAt: null },
    include: { permission: true },
  });
  return rolePermissions.map((rolePermission) => rolePermission.permission.key);
}

export function createUserWithRole({ fullName, email, passwordHash, phoneNumber, roleId }) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { fullName, email, passwordHash, phoneNumber, roleId },
    });
    await tx.userRole.create({ data: { userId: user.id, roleId } });
    return user;
  });
}

export function registerFailedLoginAttempt(userId, { attempts, lockedUntil }) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: attempts, lockedUntil },
  });
}

export function registerSuccessfulLogin(userId) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}

export function createRefreshToken({ userId, tokenHash, expiresAt }) {
  return prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
}

export function findRefreshTokenByHash(tokenHash) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export function revokeRefreshToken(id) {
  return prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
}

export function revokeAllRefreshTokensForUser(userId) {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function setPasswordResetToken(userId, { tokenHash, expiresAt }) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt },
  });
}

export function findUserByResetTokenHash(tokenHash) {
  return prisma.user.findFirst({
    where: { passwordResetTokenHash: tokenHash, deletedAt: null },
  });
}

export function updateUserAvatar(userId, avatarUrl) {
  return prisma.user.update({ where: { id: userId }, data: { avatarUrl }, include: { role: true } });
}

export function resetPasswordAndClearToken(userId, passwordHash) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
}
