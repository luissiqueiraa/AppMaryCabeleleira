import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import DateTimeSection from "../../appointments/components/DateTimeSection";
import { useRescheduleFlow } from "../../appointments/hooks/useRescheduleFlow";
import { formatServiceNames } from "../../../shared/utils/formatServices";
import { formatDateOnly, formatTime } from "../../../shared/utils/formatDate";

// Remarcar pelo painel: a cliente liga pedindo para mudar e a equipe resolve
// sem sair do dashboard. Usa o mesmo fluxo da tela da cliente, então as regras
// de horário livre, expediente e fechamento são exatamente as mesmas.
export default function RescheduleAppointmentModal({ appointmentId, onClose, onRescheduled }) {
  const dialogRef = useRef(null);
  const flow = useRescheduleFlow(appointmentId, {
    onSuccess: () => {
      onRescheduled?.();
      onClose();
    },
  });

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // No celular vira folha que sobe da base e ocupa quase toda a altura; no
    // desktop, cartão centralizado. Em ambos a altura é limitada: a lista de
    // horários é longa e, sem teto, os botões de confirmar sumiam no fim de um
    // scroll gigante.
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remarcar-titulo"
        tabIndex={-1}
        className="animate-slide-up relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl outline-none sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg"
      >
        {/* Cabeçalho e ações ficam parados; só o miolo rola. */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 p-4">
          <div className="min-w-0">
            <h2 id="remarcar-titulo" className="font-display text-lg font-semibold text-gray-900">
              Alterar data e horário
            </h2>
            {flow.appointment && (
              <p className="mt-0.5 truncate text-sm text-gray-500">
                {formatServiceNames(flow.appointment.services)} · {flow.appointment.client?.fullName}
              </p>
            )}
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

        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {flow.loadStatus === "loading" && <p className="text-sm text-gray-500">Carregando...</p>}

          {flow.loadStatus === "error" && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Não foi possível carregar o agendamento agora.
            </p>
          )}

          {flow.loadStatus === "success" && !flow.canReschedule && (
            <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              Este agendamento não pode mais ser remarcado.
            </p>
          )}

          {flow.loadStatus === "success" && flow.canReschedule && (
            <>
              {/* Mostrar o horário atual evita a equipe remarcar para o mesmo
                  lugar achando que mudou. */}
              <p className="mb-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                Hoje marcado para{" "}
                <strong className="text-gray-900">
                  {formatDateOnly(flow.appointment.scheduledAt)} às {formatTime(flow.appointment.scheduledAt)}
                </strong>{" "}
                com {flow.appointment.employee?.fullName ?? "sem profissional"}
              </p>

              <DateTimeSection
                heading="Nova data e horário"
                selectedDate={flow.date}
                selectedTime={flow.time}
                onSelectDate={flow.selectDate}
                onSelectTime={flow.selectTime}
                hours={flow.hours}
                slots={flow.slots}
                unavailableTimes={flow.unavailableTimes}
                isLoadingAvailability={flow.isLoadingAvailability}
                totalDuration={flow.durationMinutes}
                latestStart={flow.latestStart}
              />

            </>
          )}
        </div>

        {/* Ações presas ao rodapé: a cliente escolhe o horário no alto da lista
            e confirma sem procurar o botão no fim de um scroll longo. */}
        {flow.loadStatus === "success" && flow.canReschedule && (
          <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={flow.submit}
              disabled={!flow.canSubmit}
              className="flex-1 rounded-lg bg-pink-600 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {flow.isSubmitting ? "Remarcando..." : "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
