import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as rolesRepository from "../repositories/roles.repository.js";
import * as permissionsRepository from "../repositories/permissions.repository.js";

function toRoleDto(role) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    permissions: (role.rolePermissions ?? [])
      .filter((rolePermission) => !rolePermission.deletedAt)
      .map((rolePermission) => rolePermission.permission.key),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

async function resolvePermissionIds(permissionKeys) {
  if (!permissionKeys || permissionKeys.length === 0) return [];

  const permissions = await permissionsRepository.findPermissionsByKeys(permissionKeys);
  if (permissions.length !== new Set(permissionKeys).size) {
    throw new AppError("One or more permission keys are invalid", 400);
  }
  return permissions.map((permission) => permission.id);
}

export async function listRoles() {
  const roles = await rolesRepository.findAllRoles();
  return roles.map(toRoleDto);
}

export async function createRole({ name, description, permissionKeys }, req) {
  const existing = await rolesRepository.findRoleByName(name);
  if (existing) {
    throw new AppError("A role with this name already exists", 409);
  }

  const permissionIds = await resolvePermissionIds(permissionKeys);
  const role = await rolesRepository.createRole({ name, description });

  if (permissionIds.length > 0) {
    await rolesRepository.replaceRolePermissions(role.id, permissionIds);
  }

  await recordAuditLog({ userId: req.user.id, action: "role.create", entity: "Role", entityId: role.id, req });

  return toRoleDto(await rolesRepository.findRoleById(role.id));
}

export async function updateRole(roleId, { name, description, permissionKeys }, req) {
  const role = await rolesRepository.findRoleById(roleId);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (name && name !== role.name) {
    if (rolesRepository.isDefaultRoleName(role.name)) {
      throw new AppError("Default roles cannot be renamed", 403);
    }
    const nameTaken = await rolesRepository.findRoleByName(name);
    if (nameTaken) {
      throw new AppError("A role with this name already exists", 409);
    }
  }

  await rolesRepository.updateRole(roleId, {
    name: name ?? role.name,
    description: description ?? role.description,
  });

  if (permissionKeys) {
    const permissionIds = await resolvePermissionIds(permissionKeys);
    await rolesRepository.replaceRolePermissions(roleId, permissionIds);
  }

  await recordAuditLog({ userId: req.user.id, action: "role.update", entity: "Role", entityId: roleId, req });

  return toRoleDto(await rolesRepository.findRoleById(roleId));
}

export async function deleteRole(roleId, req) {
  const role = await rolesRepository.findRoleById(roleId);
  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (rolesRepository.isDefaultRoleName(role.name)) {
    throw new AppError("Default roles cannot be deleted", 403);
  }

  const activeUsers = await rolesRepository.countActiveUsersWithRole(roleId);
  if (activeUsers > 0) {
    throw new AppError("Cannot delete a role that is still assigned to users", 409);
  }

  await rolesRepository.softDeleteRole(roleId);
  await recordAuditLog({ userId: req.user.id, action: "role.delete", entity: "Role", entityId: roleId, req });
}
