import { prisma } from "../config/database.js";

export function findAllEmployees({ activeOnly }) {
  return prisma.employee.findMany({
    where: { deletedAt: null, ...(activeOnly ? { active: true } : {}) },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export function findEmployeeByUserId(userId) {
  return prisma.employee.findFirst({ where: { userId, deletedAt: null }, include: { user: true } });
}

export function findEmployeeById(id) {
  return prisma.employee.findFirst({ where: { id, deletedAt: null }, include: { user: true } });
}

export async function createEmployeeWithUser({ fullName, email, passwordHash, phoneNumber, roleId, hireDate }) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { fullName, email, passwordHash, phoneNumber, roleId } });
    await tx.userRole.create({ data: { userId: user.id, roleId } });
    const employee = await tx.employee.create({ data: { userId: user.id, hireDate } });
    return employee;
  });
}
