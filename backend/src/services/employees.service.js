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
