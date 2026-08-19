import { api } from "../../../shared/services/api";

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.patch(`/v1/appointments/${id}/status`, { status });
  return data;
}
