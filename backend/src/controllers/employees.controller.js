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

export async function createEmployeeFromUser(req, res, next) {
  try {
    const employee = await employeesService.createEmployeeFromUser(req.body, req);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const employee = await employeesService.updateEmployee(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    await employeesService.deleteEmployee(req.params.id, req);
    res.status(200).json({ success: true, data: { message: "Employee deleted" } });
  } catch (error) {
    next(error);
  }
}
