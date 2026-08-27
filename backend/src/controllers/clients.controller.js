import * as clientsService from "../services/clients.service.js";

export async function listClients(req, res, next) {
  try {
    const clients = await clientsService.listClients();
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
}
