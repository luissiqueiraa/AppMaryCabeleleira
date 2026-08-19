import { prisma } from "../config/database.js";

const DEFAULT_ROLE_NAMES = ["owner", "admin", "employee", "client"];

export function isDefaultRoleName(name) {
  return DEFAULT_ROLE_NAMES.includes(name);
}

export function findAllRoles() {
  return prisma.role.findMany({
    where: { deletedAt: null },
    include: { rolePermissions: { where: { deletedAt: null }, include: { permission: true } } },
    orderBy: { name: "asc" },
  });
}

export function findRoleById(id) {
  return prisma.role.findFirst({
    where: { id, deletedAt: null },
    include: { rolePermissions: { where: { deletedAt: null }, include: { permission: true } } },
  });
}

export function findRoleByName(name) {
  return prisma.role.findFirst({ where: { name, deletedAt: null } });
}

export function createRole({ name, description }) {
  return prisma.role.create({ data: { name, description } });
}

export function updateRole(id, { name, description }) {
  return prisma.role.update({ where: { id }, data: { name, description } });
}

export function softDeleteRole(id) {
  return prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
}

export function countActiveUsersWithRole(roleId) {
  return prisma.userRole.count({ where: { roleId, deletedAt: null } });
}

// Upsert por par (roleId, permissionId) em vez de delete+create: a constraint
// única é sobre (roleId, permissionId) sem considerar deletedAt, então
// recriar uma linha já soft-deletada anteriormente violaria a constraint.
export async function replaceRolePermissions(roleId, permissionIds) {
  const desired = new Set(permissionIds);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rolePermission.findMany({ where: { roleId } });

    for (const row of existing) {
      const shouldBeActive = desired.has(row.permissionId);
      const isActive = row.deletedAt === null;

      if (shouldBeActive && !isActive) {
        await tx.rolePermission.update({ where: { id: row.id }, data: { deletedAt: null } });
      } else if (!shouldBeActive && isActive) {
        await tx.rolePermission.update({ where: { id: row.id }, data: { deletedAt: new Date() } });
      }
    }

    const existingPermissionIds = new Set(existing.map((row) => row.permissionId));
    const toCreate = permissionIds.filter((permissionId) => !existingPermissionIds.has(permissionId));

    if (toCreate.length > 0) {
      await tx.rolePermission.createMany({
        data: toCreate.map((permissionId) => ({ roleId, permissionId })),
      });
    }
  });
}
