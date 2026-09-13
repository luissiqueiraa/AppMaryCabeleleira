import { useEffect, useState } from "react";
import KpiCard from "../../dashboard/components/KpiCard";
import UpcomingAppointmentsTable from "../components/UpcomingAppointmentsTable";
import CompletedAppointmentsHistory from "../components/CompletedAppointmentsHistory";
import { listAppointments } from "../../dashboard/services/appointmentService";
import { updateAppointmentStatus } from "../services/adminAppointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { toLocalIsoDate as isoDate } from "../../../shared/utils/formatDate";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function AdminDashboardPage() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const from = isoDate(startOfDay(new Date()));
      try {
        const { data } = await listAppointments({ from });
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

  async function handleStatusChange(id, status) {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(status === "completed" ? "Atendimento concluído." : "Agendamento atualizado.");
      setRefreshToken((n) => n + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível atualizar agora. Tente novamente em instantes."));
    }
  }

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar os agendamentos agora. Tente novamente em instantes.
      </p>
    );
  }

  const todayIso = isoDate(startOfDay(new Date()));
  const todayAppointments = appointments.filter((item) => isoDate(new Date(item.scheduledAt)) === todayIso);
  const confirmedToday = todayAppointments.filter((item) => item.status === "confirmed" || item.status === "completed");
  const revenueToday = confirmedToday.reduce((sum, item) => sum + Number(item.priceValue ?? 0), 0);

  const now = new Date();
  const upcomingAppointments = appointments
    .filter((item) => new Date(item.scheduledAt) >= now && item.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Agendamentos hoje" value={String(todayAppointments.length)} uppercaseLabel />
        <KpiCard label="Confirmados" value={String(confirmedToday.length)} uppercaseLabel />
        <KpiCard label="Recebido" value={formatBRL(revenueToday)} uppercaseLabel />
      </div>

      <CompletedAppointmentsHistory />

      <UpcomingAppointmentsTable appointments={upcomingAppointments} onStatusChange={handleStatusChange} />
    </div>
  );
}
