import { api } from "../../../shared/services/api";

export async function listAppointments(params = {}) {
  const { data } = await api.get("/v1/appointments", { params });
  return data;
}

export async function getAppointment(id) {
  const { data } = await api.get(`/v1/appointments/${id}`);
  return data;
}

export async function createAppointment(payload) {
  const { data } = await api.post("/v1/appointments", payload);
  return data;
}

export async function rescheduleAppointment(id, payload) {
  const { data } = await api.patch(`/v1/appointments/${id}/reschedule`, payload);
  return data;
}

export async function cancelAppointment(id) {
  const { data } = await api.patch(`/v1/appointments/${id}/cancel`);
  return data;
}
