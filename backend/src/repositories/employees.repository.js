import { prisma } from "../config/database.js";

// Troca a role primária + espelha em UserRole (soft-delete das antigas,
// reativa/cria a nova). Compartilhado entre promover a funcionária e
// reverter ao excluir — mesma dança em ambos os sentidos.
async function reassignPrimaryRole(tx, userId, roleId) {
  await tx.user.update({ where: { id: userId }, data: { roleId } });

  await tx.userRole.updateMany({
    where: { userId, deletedAt: null, roleId: { not: roleId } },
    data: { deletedAt: new Date() },
  });

  const existingUserRole = await tx.userRole.findUnique({ where: { userId_roleId: { userId, roleId } } });
  if (existingUserRole) {
    if (existingUserRole.deletedAt) {
      await tx.userRole.update({ where: { id: existingUserRole.id }, data: { deletedAt: null } });
    }
  } else {
    await tx.userRole.create({ data: { userId, roleId } });
  }
}

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

// Segundo modo de cadastro: promove um usuário já existente (ex: cliente)
// a funcionária. Tudo em uma única transação porque Employee.userId é
// @unique — se a troca de role tivesse sucesso mas a criação do Employee
// falhasse, o usuário ficaria com role "employee" sem registro de Employee.
export async function attachEmployeeToExistingUser({ userId, roleId, hireDate }) {
  return prisma.$transaction(async (tx) => {
    await reassignPrimaryRole(tx, userId, roleId);

    // userId é @unique em Employee: se essa pessoa já foi funcionária antes
    // (registro soft-deletado), reativa em vez de tentar criar de novo.
    const existingEmployee = await tx.employee.findUnique({ where: { userId } });
    if (existingEmployee) {
      return tx.employee.update({
        where: { id: existingEmployee.id },
        data: { deletedAt: null, active: true, hireDate: hireDate ?? existingEmployee.hireDate },
      });
    }
    return tx.employee.create({ data: { userId, hireDate: hireDate ?? new Date() } });
  });
}

export async function updateEmployee(id, { fullName, email, phoneNumber, active }) {
  const employee = await prisma.employee.findFirst({ where: { id, deletedAt: null } });
  if (!employee) return null;

  await prisma.$transaction(async (tx) => {
    const userData = {};
    if (fullName !== undefined) userData.fullName = fullName;
    if (email !== undefined) userData.email = email;
    if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;

    if (Object.keys(userData).length > 0) {
      await tx.user.update({ where: { id: employee.userId }, data: userData });
    }
    if (active !== undefined) {
      await tx.employee.update({ where: { id }, data: { active } });
    }
  });

  return findEmployeeById(id);
}

// Reverte a role primária para client ao excluir — sem isso o usuário
// mantinha role/permissions de funcionária (e acesso às telas de admin)
// mesmo depois de removida, porque o token só é reemitido com a role
// atual do banco no próximo refresh, e nada nunca corrigia essa role.
export async function deleteEmployee(id, clientRoleId) {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.update({ where: { id }, data: { deletedAt: new Date() } });
    await reassignPrimaryRole(tx, employee.userId, clientRoleId);
    return employee;
  });
}
