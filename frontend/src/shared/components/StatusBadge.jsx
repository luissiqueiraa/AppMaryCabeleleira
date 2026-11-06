import { APPOINTMENT_STATUS } from "../constants/appointmentStatus";

// Agendamento confirmado (o padrão, sem etapa de aprovação) não ganha badge
// aqui: numa lista em que quase tudo está confirmado, a etiqueta em toda linha
// é ruído. Onde a lista mistura situações — o histórico do painel — a etiqueta
// aparece sempre, usando as mesmas cores de APPOINTMENT_STATUS.
const HIDDEN_STATUSES = ["confirmed"];

export default function StatusBadge({ status }) {
  const config = APPOINTMENT_STATUS[status];
  if (!config || HIDDEN_STATUSES.includes(status)) return null;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
