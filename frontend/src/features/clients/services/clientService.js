import { api } from "../../../shared/services/api";

export async function listClients() {
  const { data } = await api.get("/v1/clients");
  return data;
}
