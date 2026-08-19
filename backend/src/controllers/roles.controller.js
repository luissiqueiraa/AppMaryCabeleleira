import * as rolesService from "../services/roles.service.js";

export async function listRoles(req, res, next) {
  try {
    const roles = await rolesService.listRoles();
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function createRole(req, res, next) {
  try {
    const role = await rolesService.createRole(req.body, req);
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req, res, next) {
  try {
    const role = await rolesService.updateRole(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req, res, next) {
  try {
    await rolesService.deleteRole(req.params.id, req);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
