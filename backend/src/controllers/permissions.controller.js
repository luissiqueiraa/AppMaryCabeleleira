import * as permissionsService from "../services/permissions.service.js";

export async function listPermissions(req, res, next) {
  try {
    const permissions = await permissionsService.listPermissions();
    res.status(200).json({ success: true, data: permissions });
  } catch (error) {
    next(error);
  }
}
