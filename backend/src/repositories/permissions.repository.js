import { prisma } from "../config/database.js";

export function findAllPermissions() {
  return prisma.permission.findMany({ where: { deletedAt: null }, orderBy: { key: "asc" } });
}

export function findPermissionsByKeys(keys) {
  return prisma.permission.findMany({ where: { key: { in: keys }, deletedAt: null } });
}
