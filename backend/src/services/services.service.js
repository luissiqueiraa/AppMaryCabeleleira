import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as servicesRepository from "../repositories/services.repository.js";
import { assertCategoryExists } from "./serviceCategories.service.js";

function toServiceDto(service) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    categoryId: service.categoryId,
    // slug para o frontend escolher o ícone, nome para exibir. Mandar só o id
    // obrigaria cada tela a cruzar com a lista de categorias.
    category: service.category?.slug ?? null,
    categoryName: service.category?.name ?? null,
    categoryIcon: service.category?.icon ?? null,
    duration: service.duration,
    price: Number(service.price),
    active: service.active,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

export async function listServices(actorPermissions = []) {
  const canManage = actorPermissions.includes("manage_services");
  const services = await servicesRepository.findAllServices({ activeOnly: !canManage });
  return services.map(toServiceDto);
}

export async function createService(payload, req) {
  await assertCategoryExists(payload.categoryId);
  const service = await servicesRepository.createService(payload);
  await recordAuditLog({
    userId: req.user.id,
    action: "service.create",
    entity: "Service",
    entityId: service.id,
    req,
  });
  return toServiceDto(service);
}

export async function updateService(id, payload, req) {
  const service = await servicesRepository.findServiceById(id);
  if (!service) {
    throw new AppError("Service not found", 404);
  }

  if (payload.categoryId) {
    await assertCategoryExists(payload.categoryId);
  }

  const updated = await servicesRepository.updateService(id, payload);
  await recordAuditLog({
    userId: req.user.id,
    action: "service.update",
    entity: "Service",
    entityId: id,
    req,
  });
  return toServiceDto(updated);
}

export async function deleteService(id, req) {
  const service = await servicesRepository.findServiceById(id);
  if (!service) {
    throw new AppError("Service not found", 404);
  }

  await servicesRepository.deleteService(id);
  await recordAuditLog({
    userId: req.user.id,
    action: "service.delete",
    entity: "Service",
    entityId: id,
    req,
  });
}
