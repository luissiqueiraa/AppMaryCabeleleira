import * as usersService from "../services/users.service.js";

export async function listUsers(req, res, next) {
  try {
    const result = await usersService.listUsers(req.query);
    res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function assignRole(req, res, next) {
  try {
    const user = await usersService.assignUserRole(req.params.id, req.body.roleId, req.user, req);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
