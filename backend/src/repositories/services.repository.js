import { prisma } from "../config/database.js";

export function findAllServices({ activeOnly }) {
  return prisma.service.findMany({
    where: { deletedAt: null, ...(activeOnly ? { active: true } : {}) },
    orderBy: { name: "asc" },
  });
}

export function findServiceById(id) {
  return prisma.service.findFirst({ where: { id, deletedAt: null } });
}

export function createService({ name, description, duration, price }) {
  return prisma.service.create({ data: { name, description, duration, price } });
}

export function updateService(id, data) {
  return prisma.service.update({ where: { id }, data });
}
