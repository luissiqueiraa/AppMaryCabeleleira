import { api } from "../../../shared/services/api";

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.patch(`/v1/appointments/${id}/status`, { status });
  return data;
}

// Baixa do dinheiro recebido no salão. Separado de updateAppointmentStatus de
// propósito: concluir o atendimento e receber o valor são decisões distintas.
export async function updateAppointmentPayment(id, paymentStatus) {
  const { data } = await api.patch(`/v1/appointments/${id}/payment`, { paymentStatus });
  return data;
}

// Exclusão (soft delete no backend): para erro de lançamento. Cancelar é o
// caminho de "a cliente desistiu", e preserva o histórico.
export async function deleteAppointment(id) {
  await api.delete(`/v1/appointments/${id}`);
}
