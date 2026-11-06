import { api } from "../../../shared/services/api";

// Cobrança online (pix/cartão). O horário só vira agendamento quando o
// provedor aprova o pagamento — por isso a cobrança é criada aqui e não em
// appointmentService, que agenda na hora.
export async function createPayment(payload) {
  const { data } = await api.post("/v1/payments", payload);
  return data;
}

export async function getPayment(id) {
  const { data } = await api.get(`/v1/payments/${id}`);
  return data;
}
