import { prisma } from "../config/database.js";

export function findAllCategories({ activeOnly }) {
  return prisma.serviceCategory.findMany({
    where: { deletedAt: null, ...(activeOnly ? { active: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function findCategoryById(id) {
  return prisma.serviceCategory.findFirst({ where: { id, deletedAt: null } });
}

// Inclui as excluídas de propósito: o slug e o nome são únicos no banco
// inteiro, então recriar "Cabelo" depois de excluir bateria no índice único.
// Quem chama reativa a antiga em vez de criar outra.
export function findCategoryByNameOrSlug({ name, slug }) {
  return prisma.serviceCategory.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
}

export function findCategoriesBySlugPrefix(slug) {
  return prisma.serviceCategory.findMany({
    where: { slug: { startsWith: slug } },
    select: { slug: true },
  });
}

export function createCategory(data) {
  return prisma.serviceCategory.create({ data });
}

export function updateCategory(id, data) {
  return prisma.serviceCategory.update({ where: { id }, data });
}

export function softDeleteCategory(id) {
  return prisma.serviceCategory.update({ where: { id }, data: { deletedAt: new Date() } });
}

// Serviços vivos naquela categoria. É o que impede excluir uma categoria em
// uso e deixar o catálogo inconsistente.
export function countServicesInCategory(categoryId) {
  return prisma.service.count({ where: { categoryId, deletedAt: null } });
}
