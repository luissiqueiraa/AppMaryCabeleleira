import { useEffect, useRef } from "react";
import { FiX, FiClock, FiPhone } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import { formatFullDate, formatTime } from "../../../shared/utils/formatDate";
import { formatBRL } from "../../../shared/utils/formatCurrency";

// Pendente (dado legado) precisa de saída na tela: confirmar primeiro,
// concluir depois.
const NEXT_ACTION = {
  pending: { status: "confirmed", label: "Confirmar agendamento" },
  confirmed: { status: "completed", label: "Concluir atendimento" },
};

export default function AppointmentDetailModal({
  appointment,
  isUpdating,
  onClose,
  onStatusChange,
  onRequestCancel,
  onPaymentChange,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  if (!appointment) return null;

  const endTime = formatTime(
    new Date(new Date(appointment.scheduledAt).getTime() + appointment.durationMinutes * 60000)
  );
  const action = NEXT_ACTION[appointment.status];
  const canCancel = ["pending", "confirmed"].includes(appointment.status);
  // Só o presencial tem baixa manual: pix e cartão são confirmados pelo
  // provedor, e o caixa não pode depender de quem clica.
  const canConfirmPayment =
    onPaymentChange &&
    appointment.paymentMethod === "on_site" &&
    appointment.paymentStatus === "pending" &&
    appointment.status !== "cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-detail-title"
        tabIndex={-1}
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl outline-none"
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h2 id="appointment-detail-title" className="font-display text-lg font-semibold text-gray-900">
              {appointment.service}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{formatFullDate(appointment.date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <StatusBadge status={appointment.status} />

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <FiClock aria-hidden="true" />
            {formatTime(appointment.scheduledAt)} - {endTime}
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="font-semibold text-gray-900">{appointment.client}</p>
            {appointment.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                <FiPhone size={13} aria-hidden="true" />
                {appointment.phone}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Profissional</p>
            <p className="font-semibold text-gray-900">{appointment.professional}</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
            <p className="text-xs text-gray-400">Valor</p>
            <p className="font-semibold text-gray-900">{formatBRL(appointment.price)}</p>
          </div>

          {appointment.notes && (
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-400">Observação</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {action && (
            <button
              type="button"
              onClick={() => onStatusChange(appointment.id, action.status)}
              disabled={isUpdating}
              className="w-full rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? "Salvando..." : action.label}
            </button>
          )}

          {canConfirmPayment && (
            <button
              type="button"
              onClick={() => onPaymentChange(appointment.id, "paid")}
              disabled={isUpdating}
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Confirmar recebimento
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => onRequestCancel(appointment.id)}
              disabled={isUpdating}
              className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar agendamento
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
