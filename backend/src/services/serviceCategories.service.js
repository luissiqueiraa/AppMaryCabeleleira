import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as categoriesRepository from "../repositories/serviceCategories.repository.js";

function toCategoryDto(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    sortOrder: category.sortOrder,
    active: category.active,
  };
}

// "Escova e Hidratação" -> "escova-e-hidratacao". O slug é o identificador
// estável: nasce do nome, mas não acompanha renomeações, porque o frontend
// escolhe ícone por ele e mudá-lo trocaria o ícone sem aviso.
export function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

// Dois nomes diferentes podem gerar o mesmo slug ("Pés" e "PES"). Nesse caso
// numera, porque o slug é único no banco.
async function uniqueSlug(base) {
  const fallback = base || "categoria";
  const existentes = new Set(
    (await categoriesRepository.findCategoriesBySlugPrefix(fallback)).map((c) => c.slug)
  );
  if (!existentes.has(fallback)) return fallback;

  for (let sufixo = 2; sufixo < 1000; sufixo += 1) {
    const candidato = `${fallback}-${sufixo}`;
    if (!existentes.has(candidato)) return candidato;
  }
  throw new AppError("Could not generate a unique category slug", 409);
}

export async function listCategories(actorPermissions = []) {
  const canManage = actorPermissions.includes("manage_services");
  const categories = await categoriesRepository.findAllCategories({ activeOnly: !canManage });
  return categories.map(toCategoryDto);
}

export async function createCategory({ name, icon, sortOrder }, req) {
  const slug = slugify(name);
  const existente = await categoriesRepository.findCategoryByNameOrSlug({ name, slug });

  if (existente && existente.deletedAt === null) {
    throw new AppError("A category with this name already exists", 409);
  }

  // Categoria excluída com o mesmo nome: reativa em vez de criar uma segunda,
  // senão o índice único do nome recusaria a inserção.
  if (existente) {
    const revivida = await categoriesRepository.updateCategory(existente.id, {
      deletedAt: null,
      active: true,
      name,
      ...(icon === undefined ? {} : { icon }),
      ...(sortOrder === undefined ? {} : { sortOrder }),
    });
    await recordAuditLog({
      userId: req.user.id,
      action: "serviceCategory.restore",
      entity: "ServiceCategory",
      entityId: revivida.id,
      req,
    });
    return toCategoryDto(revivida);
  }

  const category = await categoriesRepository.createCategory({
    name,
    slug: await uniqueSlug(slug),
    ...(icon === undefined ? {} : { icon }),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "serviceCategory.create",
    entity: "ServiceCategory",
    entityId: category.id,
    req,
  });
  return toCategoryDto(category);
}

export async function updateCategory(id, payload, req) {
  const category = await categoriesRepository.findCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (payload.name && payload.name !== category.name) {
    const existente = await categoriesRepository.findCategoryByNameOrSlug({ name: payload.name });
    if (existente && existente.id !== id) {
      throw new AppError("A category with this name already exists", 409);
    }
  }

  const updated = await categoriesRepository.updateCategory(id, payload);
  await recordAuditLog({
    userId: req.user.id,
    action: "serviceCategory.update",
    entity: "ServiceCategory",
    entityId: id,
    req,
  });
  return toCategoryDto(updated);
}

export async function deleteCategory(id, req) {
  const category = await categoriesRepository.findCategoryById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  // Excluir uma categoria em uso deixaria serviços órfãos. A saída é mover os
  // serviços antes, e a mensagem diz quantos são para a decisão ser informada.
  const emUso = await categoriesRepository.countServicesInCategory(id);
  if (emUso > 0) {
    throw new AppError("Cannot delete a category that still has services", 409);
  }

  await categoriesRepository.softDeleteCategory(id);
  await recordAuditLog({
    userId: req.user.id,
    action: "serviceCategory.delete",
    entity: "ServiceCategory",
    entityId: id,
    req,
  });
}

// Usado pelo cadastro de serviço: a categoria tem de existir e estar viva.
export async function assertCategoryExists(categoryId) {
  const category = await categoriesRepository.findCategoryById(categoryId);
  if (!category) {
    throw new AppError("Category not found", 422);
  }
  return category;
}
