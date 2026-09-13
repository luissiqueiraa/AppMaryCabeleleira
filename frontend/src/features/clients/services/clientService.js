import { api } from "../../../shared/services/api";

export async function listClients() {
  const { data } = await api.get("/v1/clients");
  return data;
}

export async function deleteClient(id) {
  const { data } = await api.delete(`/v1/clients/${id}`);
  return data;
}
