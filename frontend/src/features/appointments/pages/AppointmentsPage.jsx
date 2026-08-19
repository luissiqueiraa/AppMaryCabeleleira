import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppointmentCard from "../components/AppointmentCard";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { listAppointments, cancelAppointment } from "../../dashboard/services/appointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [target, setTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data } = await listAppointments();
        if (isMounted) {
          setAppointments(
            data.map(mapAppointment).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
          );
          setLoadStatus("success");
        }
      } catch {
        if (isMounted) setLoadStatus("error");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [refreshToken]);

  async function handleConfirmCancel() {
    setIsCancelling(true);
    setError("");
    try {
      await cancelAppointment(target.id);
      setTarget(null);
      setRefreshToken((n) => n + 1);
    } catch {
      setError("Não foi possível cancelar agora. Tente novamente em instantes.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{appointments.length} agendamentos</p>
        <Link
          to="/appointments/new"
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
        >
          Agendar agora
        </Link>
      </div>

      {(error || loadStatus === "error") && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error || "Não foi possível carregar seus agendamentos agora. Tente novamente em instantes."}
        </p>
      )}

      {appointments.length === 0 && loadStatus === "success" ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Você ainda não tem agendamentos.
        </p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onCancel={setTarget} />
          ))}
        </ul>
      )}

      <ConfirmationModal
        open={Boolean(target)}
        title="Cancelar agendamento"
        description={target ? `Tem certeza que deseja cancelar ${target.service}?` : ""}
        confirmLabel="Sim, cancelar"
        cancelLabel="Manter horário"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
