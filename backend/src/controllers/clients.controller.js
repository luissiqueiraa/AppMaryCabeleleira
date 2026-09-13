import * as clientsService from "../services/clients.service.js";

export async function listClients(req, res, next) {
  try {
    const clients = await clientsService.listClients();
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req, res, next) {
  try {
    await clientsService.deleteClient(req.params.id, req);
    res.status(200).json({ success: true, data: { message: "Client deleted" } });
  } catch (error) {
    next(error);
  }
}
