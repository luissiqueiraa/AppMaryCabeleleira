import * as servicesService from "../services/services.service.js";

// GET /services — catálogo de serviços do salão. Aberto a qualquer usuária
// autenticada (a cliente precisa dele para agendar), mas as permissions vão
// para o service porque quem não administra só enxerga os serviços ativos.
export async function listServices(req, res, next) {
  try {
    const services = await servicesService.listServices(req.user.permissions);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

// POST /services — cadastra um serviço novo (nome, categoria, duração, preço).
// Restrito a manage_services. Responde 201 com o serviço já criado.
export async function createService(req, res, next) {
  try {
    const service = await servicesService.createService(req.body, req);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

// PATCH /services/:id — edita um serviço existente. Alterar preço ou duração
// aqui não mexe em agendamentos já feitos: eles guardam a própria cópia desses
// valores, congelada no momento do agendamento.
export async function updateService(req, res, next) {
  try {
    const service = await servicesService.updateService(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

// DELETE /services/:id — exclusão lógica (preenche deletedAt). O registro
// continua no banco para não quebrar o histórico de quem já contratou o serviço.
export async function deleteService(req, res, next) {
  try {
    await servicesService.deleteService(req.params.id, req);
    res.status(200).json({ success: true, data: { message: "Service deleted" } });
  } catch (error) {
    next(error);
  }
}
