import { api } from "../../../shared/services/api";

export async function listEmployees() {
  const { data } = await api.get("/v1/employees");
  return data;
}

export async function createEmployee(payload) {
  const { data } = await api.post("/v1/employees", payload);
  return data;
}

export async function createEmployeeFromUser(payload) {
  const { data } = await api.post("/v1/employees/from-user", payload);
  return data;
}

export async function searchUsers(search) {
  const { data } = await api.get("/v1/users", { params: { search, limit: 20 } });
  return data;
}

export async function updateEmployee(id, payload) {
  const { data } = await api.patch(`/v1/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id) {
  const { data } = await api.delete(`/v1/employees/${id}`);
  return data;
}
