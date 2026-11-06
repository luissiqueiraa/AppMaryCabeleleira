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

export function findServicesByIds(ids) {
  return prisma.service.findMany({ where: { id: { in: ids }, deletedAt: null } });
}

export function createService({ name, description, category, duration, price }) {
  return prisma.service.create({ data: { name, description, category, duration, price } });
}

export function updateService(id, data) {
  return prisma.service.update({ where: { id }, data });
}

export function deleteService(id) {
  return prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
}
