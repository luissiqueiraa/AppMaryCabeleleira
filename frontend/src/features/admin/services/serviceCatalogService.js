import { api } from "../../../shared/services/api";

export async function listServices() {
  const { data } = await api.get("/v1/services");
  return data;
}

export async function createService(payload) {
  const { data } = await api.post("/v1/services", payload);
  return data;
}

export async function updateService(id, payload) {
  const { data } = await api.patch(`/v1/services/${id}`, payload);
  return data;
}

export async function deleteService(id) {
  const { data } = await api.delete(`/v1/services/${id}`);
  return data;
}
