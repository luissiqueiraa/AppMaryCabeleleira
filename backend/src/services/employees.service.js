import { AppError } from "../utils/AppError.js";
import { hashPassword } from "../utils/password.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as employeesRepository from "../repositories/employees.repository.js";
import * as authRepository from "../repositories/auth.repository.js";

function toEmployeeDto(employee) {
  return {
    id: employee.id,
    hireDate: employee.hireDate,
    active: employee.active,
    user: {
      id: employee.user.id,
      fullName: employee.user.fullName,
      email: employee.user.email,
      phoneNumber: employee.user.phoneNumber,
      avatarUrl: employee.user.avatarUrl,
    },
    createdAt: employee.createdAt,
  };
}

export async function listEmployees(actorPermissions = []) {
  const canManage = actorPermissions.includes("manage_users");
  const employees = await employeesRepository.findAllEmployees({ activeOnly: !canManage });
  return employees.map(toEmployeeDto);
}

export async function createEmployee({ fullName, email, password, phoneNumber, hireDate }, req) {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Email is already in use", 409);
  }

  const employeeRole = await authRepository.findRoleByName("employee");
  if (!employeeRole) {
    throw new AppError("Employee role is not configured", 500);
  }

  const passwordHash = await hashPassword(password);
  const employee = await employeesRepository.createEmployeeWithUser({
    fullName,
    email,
    passwordHash,
    phoneNumber,
    roleId: employeeRole.id,
    hireDate: hireDate ?? new Date(),
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "employee.create",
    entity: "Employee",
    entityId: employee.id,
    req,
  });

  return toEmployeeDto(await employeesRepository.findEmployeeByUserId(employee.userId));
}

export async function createEmployeeFromUser({ userId, hireDate }, req) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (user.role?.name === "owner") {
    throw new AppError("The owner account cannot be modified", 403);
  }
  if (user.role?.name === "admin" && req.user.role !== "owner") {
    throw new AppError("Only the owner can assign this role", 403);
  }

  const existingEmployee = await employeesRepository.findEmployeeByUserId(userId);
  if (existingEmployee) {
    throw new AppError("This user is already an employee", 409);
  }

  const employeeRole = await authRepository.findRoleByName("employee");
  if (!employeeRole) {
    throw new AppError("Employee role is not configured", 500);
  }

  const employee = await employeesRepository.attachEmployeeToExistingUser({
    userId,
    roleId: employeeRole.id,
    hireDate: hireDate ?? new Date(),
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "employee.create_from_user",
    entity: "Employee",
    entityId: employee.id,
    req,
  });

  return toEmployeeDto(await employeesRepository.findEmployeeByUserId(employee.userId));
}

export async function updateEmployee(id, payload, req) {
  if (payload.email) {
    const existingUser = await authRepository.findUserByEmail(payload.email);
    const employee = await employeesRepository.findEmployeeById(id);
    if (!employee) {
      throw new AppError("Employee not found", 404);
    }
    if (existingUser && existingUser.id !== employee.user.id) {
      throw new AppError("Email is already in use", 409);
    }
  }

  const updated = await employeesRepository.updateEmployee(id, payload);
  if (!updated) {
    throw new AppError("Employee not found", 404);
  }

  await recordAuditLog({
    userId: req.user.id,
    action: "employee.update",
    entity: "Employee",
    entityId: id,
    req,
  });
  return toEmployeeDto(updated);
}

export async function deleteEmployee(id, req) {
  const employee = await employeesRepository.findEmployeeById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const clientRole = await authRepository.findRoleByName("client");
  if (!clientRole) {
    throw new AppError("Client role is not configured", 500);
  }

  await employeesRepository.deleteEmployee(id, clientRole.id);
  await recordAuditLog({
    userId: req.user.id,
    action: "employee.delete",
    entity: "Employee",
    entityId: id,
    req,
  });
}
