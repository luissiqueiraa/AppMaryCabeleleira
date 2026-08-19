import * as servicesService from "../services/services.service.js";

export async function listServices(req, res, next) {
  try {
    const services = await servicesService.listServices(req.user.permissions);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const service = await servicesService.createService(req.body, req);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const service = await servicesService.updateService(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}
