import { api } from "../../../shared/services/api";

export async function listServiceCategories() {
  const { data } = await api.get("/v1/service-categories");
  return data;
}

export async function createServiceCategory(payload) {
  const { data } = await api.post("/v1/service-categories", payload);
  return data;
}

export async function updateServiceCategory(id, payload) {
  const { data } = await api.patch(`/v1/service-categories/${id}`, payload);
  return data;
}

export async function deleteServiceCategory(id) {
  const { data } = await api.delete(`/v1/service-categories/${id}`);
  return data;
}
