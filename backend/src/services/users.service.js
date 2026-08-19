import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as usersRepository from "../repositories/users.repository.js";
import * as rolesRepository from "../repositories/roles.repository.js";

// Só o owner pode conceder acesso de owner/admin — admin com manage_users
// não escala privilégio além de employee/client.
const ELEVATED_ROLE_NAMES = ["owner", "admin"];

function toUserDto(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    status: user.status,
    role: user.role ? { id: user.role.id, name: user.role.name } : null,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function listUsers({ page, limit }) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    usersRepository.findManyUsers({ skip, take: limit }),
    usersRepository.countUsers(),
  ]);

  return {
    items: users.map(toUserDto),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(id) {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return toUserDto(user);
}

export async function assignUserRole(targetUserId, roleId, actor, req) {
  const targetUser = await usersRepository.findUserById(targetUserId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (targetUser.role?.name === "owner") {
    throw new AppError("The owner account cannot be modified", 403);
  }

  const newRole = await rolesRepository.findRoleById(roleId);
  if (!newRole) {
    throw new AppError("Role not found", 404);
  }

  if (ELEVATED_ROLE_NAMES.includes(newRole.name) && actor.role !== "owner") {
    throw new AppError("Only the owner can assign this role", 403);
  }

  await usersRepository.setUserPrimaryRole(targetUserId, roleId);
  await recordAuditLog({
    userId: actor.id,
    action: "user.role_assigned",
    entity: "User",
    entityId: targetUserId,
    req,
  });

  return toUserDto(await usersRepository.findUserById(targetUserId));
}
