import { useEffect, useState } from "react";
import WelcomeCard from "../components/WelcomeCard";
import NextStepCard from "../components/NextStepCard";
import QuickActions from "../components/QuickActions";
import KpiCard from "../components/KpiCard";
import HistoryList from "../components/HistoryList";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { listAppointments, cancelAppointment } from "../services/appointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";

const ACTIVE_STATUSES = ["pending", "confirmed"];

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const { data } = await listAppointments();
        if (isMounted) {
          setAppointments(data.map(mapAppointment));
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

  const now = new Date();
  const nextAppointment =
    appointments
      .filter((item) => ACTIVE_STATUSES.includes(item.status) && new Date(item.scheduledAt) >= now)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] ?? null;

  const lastVisit = appointments
    .filter((item) => item.status === "completed")
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))[0];

  const kpis = [
    { id: "visits", label: "Atendimentos", value: String(appointments.length), hint: "desde o cadastro" },
    lastVisit
      ? { id: "lastVisit", label: "Última visita", value: lastVisit.date, hint: `${lastVisit.service} com ${lastVisit.professional}` }
      : { id: "lastVisit", label: "Última visita", value: "—", hint: "nenhuma ainda" },
  ];

  const recentHistory = [...appointments]
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
    .slice(0, 3);

  async function handleConfirmCancel() {
    if (!nextAppointment) return;
    setIsCancelling(true);
    setCancelError("");
    try {
      await cancelAppointment(nextAppointment.id);
      setCancelModalOpen(false);
      setRefreshToken((n) => n + 1);
    } catch {
      setCancelError("Não foi possível cancelar agora. Tente novamente em instantes.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar seus agendamentos agora. Tente novamente em instantes.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WelcomeCard appointment={nextAppointment} onCancel={() => setCancelModalOpen(true)} />

      <div className="lg:hidden">
        <QuickActions />
      </div>

      {cancelError && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {cancelError}
        </p>
      )}

      <div className="hidden gap-4 sm:grid sm:grid-cols-3">
        <KpiCard key={kpis[0].id} {...kpis[0]} />
        <NextStepCard />
        <KpiCard key={kpis[1].id} {...kpis[1]} />
      </div>

      <HistoryList items={recentHistory} />

      <ConfirmationModal
        open={cancelModalOpen}
        title="Cancelar agendamento"
        description={
          nextAppointment
            ? `Tem certeza que deseja cancelar ${nextAppointment.service} com ${nextAppointment.professional}?`
            : ""
        }
        confirmLabel="Sim, cancelar"
        cancelLabel="Manter horário"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}
