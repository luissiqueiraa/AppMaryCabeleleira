import * as permissionsRepository from "../repositories/permissions.repository.js";

export async function listPermissions() {
  const permissions = await permissionsRepository.findAllPermissions();
  return permissions.map((permission) => ({
    id: permission.id,
    key: permission.key,
    description: permission.description,
  }));
}
