import { useParams, useNavigate, Link } from "react-router-dom";
import DateTimeSection from "../components/DateTimeSection";
import { useRescheduleFlow } from "../hooks/useRescheduleFlow";
import { formatServiceNames } from "../../../shared/utils/formatServices";

export default function RescheduleAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const flow = useRescheduleFlow(id, { onSuccess: () => navigate(`/appointments/${id}`) });

  if (flow.loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (flow.loadStatus === "error" || !flow.appointment) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Agendamento não encontrado.</p>
        <Link to="/appointments" className="mt-3 inline-block text-sm font-semibold text-pink-600 hover:underline">
          Voltar para agendamentos
        </Link>
      </div>
    );
  }

  if (!flow.canReschedule) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Este agendamento não pode mais ser remarcado.</p>
        <Link
          to={`/appointments/${id}`}
          className="mt-3 inline-block text-sm font-semibold text-pink-600 hover:underline"
        >
          Voltar para o agendamento
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">
          Remarcar {formatServiceNames(flow.appointment.services)}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          com {flow.appointment.employee?.fullName ?? "Sem preferência"}
        </p>
      </div>

      <DateTimeSection
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

      {/* Empilhados no celular: lado a lado, "Confirmar nova data" quebrava em
          duas linhas e ficava com metade da altura do outro botão. A ação
          principal vem primeiro na ordem visual em ambos os casos. */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Link
          to={`/appointments/${id}`}
          className="flex-1 rounded-lg border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Voltar
        </Link>
        <button
          type="button"
          onClick={flow.submit}
          disabled={!flow.canSubmit}
          className="flex-1 rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {flow.isSubmitting ? "Remarcando..." : "Confirmar nova data"}
        </button>
      </div>
    </div>
  );
}
