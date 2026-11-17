import { prisma } from "../config/database.js";

// A categoria vem junto em toda leitura: o DTO expõe nome e slug dela, e sem
// o include seria uma consulta por serviço na montagem da lista.
const withCategory = { category: true };

export function findAllServices({ activeOnly }) {
  return prisma.service.findMany({
    where: { deletedAt: null, ...(activeOnly ? { active: true } : {}) },
    include: withCategory,
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
}

export function findServiceById(id) {
  return prisma.service.findFirst({ where: { id, deletedAt: null }, include: withCategory });
}

export function findServicesByIds(ids) {
  return prisma.service.findMany({ where: { id: { in: ids }, deletedAt: null }, include: withCategory });
}

export function createService({ name, description, categoryId, duration, price }) {
  return prisma.service.create({
    data: { name, description, categoryId, duration, price },
    include: withCategory,
  });
}

export function updateService(id, data) {
  return prisma.service.update({ where: { id }, data, include: withCategory });
}

export function deleteService(id) {
  return prisma.service.update({ where: { id }, data: { deletedAt: new Date() } });
}
