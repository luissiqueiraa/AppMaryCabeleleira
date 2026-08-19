import * as employeesService from "../services/employees.service.js";

export async function listEmployees(req, res, next) {
  try {
    const employees = await employeesService.listEmployees(req.user.permissions);
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const employee = await employeesService.createEmployee(req.body, req);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}
