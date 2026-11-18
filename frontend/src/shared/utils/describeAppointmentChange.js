import { formatDateOnly, formatTime } from "./formatDate";

const LABELS = {
  created: "Novo agendamento",
  rescheduled: "Agendamento remarcado",
  cancelled: "Agendamento cancelado",
  completed: "Atendimento concluído",
  status_changed: "Agendamento atualizado",
  payment_received: "Pagamento registrado",
  payment_reverted: "Baixa de pagamento desfeita",
  deleted: "Agendamento excluído",
  refunded: "Estorno registrado",
};

// Texto do aviso que o painel mostra quando outra pessoa mexe num agendamento:
// "Novo agendamento: Maria · 18/11 às 14:30".
export function describeAppointmentChange(change) {
  // Cancelamento de horário já pago pede ação da equipe: devolver o valor.
  const label =
    change?.action === "cancelled" && change.paymentStatus === "paid"
      ? "Cancelado com pagamento a devolver"
      : LABELS[change?.action];
  if (!label) return null;
  const who = change.clientName ? `: ${change.clientName}` : "";
  const when = change.scheduledAt
    ? ` · ${formatDateOnly(change.scheduledAt)} às ${formatTime(change.scheduledAt)}`
    : "";
  return `${label}${who}${when}`;
}
