import { api } from "../../../shared/services/api";

export async function listEmployees() {
  const { data } = await api.get("/v1/employees");
  return data;
}
