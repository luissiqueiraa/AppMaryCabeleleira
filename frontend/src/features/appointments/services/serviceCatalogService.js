import { api } from "../../../shared/services/api";

export async function listServices() {
  const { data } = await api.get("/v1/services");
  return data;
}
