import { prisma } from "../config/database.js";

function buildSearchWhere(search) {
  return {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export function findManyUsers({ skip, take, search }) {
  return prisma.user.findMany({
    where: buildSearchWhere(search),
    include: { role: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export function countUsers(search) {
  return prisma.user.count({ where: buildSearchWhere(search) });
}

export function findUserById(id) {
  return prisma.user.findFirst({ where: { id, deletedAt: null }, include: { role: true } });
}

// Mesmo cuidado de upsert do roles.repository: (userId, roleId) já pode
// existir soft-deletado se o usuário estiver voltando a uma role anterior.
export async function setUserPrimaryRole(userId, roleId) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { roleId } });

    await tx.userRole.updateMany({
      where: { userId, deletedAt: null, roleId: { not: roleId } },
      data: { deletedAt: new Date() },
    });

    const existingTarget = await tx.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });

    if (existingTarget) {
      if (existingTarget.deletedAt) {
        await tx.userRole.update({ where: { id: existingTarget.id }, data: { deletedAt: null } });
      }
    } else {
      await tx.userRole.create({ data: { userId, roleId } });
    }
  });
}
