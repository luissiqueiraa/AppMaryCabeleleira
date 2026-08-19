import { useEffect, useState } from "react";
import KpiCard from "../../dashboard/components/KpiCard";
import AppointmentsChart from "../components/AppointmentsChart";
import UpcomingAppointmentsTable from "../components/UpcomingAppointmentsTable";
import { listAppointments } from "../../dashboard/services/appointmentService";
import { updateAppointmentStatus } from "../services/adminAppointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { toLocalIsoDate as isoDate } from "../../../shared/utils/formatDate";

const DAYS_BACK = 13;

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function AdminDashboardPage() {
  const [appointments, setAppointments] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const today = startOfDay(new Date());
      const from = isoDate(new Date(today.getTime() - DAYS_BACK * 24 * 60 * 60 * 1000));
      try {
        // Sem "to": cobre o histórico (para o gráfico) e também qualquer
        // agendamento futuro (para "Próximos atendimentos"), sem limite superior.
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
      setRefreshToken((n) => n + 1);
    } catch {
      // silencioso: a linha simplesmente não muda; usuário pode tentar de novo
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

  const adminKpis = [
    { id: "today", label: "Agendamentos hoje", value: String(todayAppointments.length) },
    { id: "confirmed", label: "Confirmados", value: String(confirmedToday.length) },
    { id: "revenue", label: "Receita prevista", value: formatBRL(revenueToday) },
  ];

  const dailyAppointments = Array.from({ length: DAYS_BACK + 1 }, (_, index) => {
    const day = new Date(startOfDay(new Date()).getTime() - (DAYS_BACK - index) * 24 * 60 * 60 * 1000);
    const dayIso = isoDate(day);
    const value = appointments.filter(
      (item) => isoDate(new Date(item.scheduledAt)) === dayIso && item.status !== "cancelled"
    ).length;
    return { day: String(day.getDate()).padStart(2, "0"), value };
  });

  const now = new Date();
  const upcomingAppointments = appointments
    .filter((item) => new Date(item.scheduledAt) >= now && item.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {adminKpis.map((kpi) => (
          <KpiCard key={kpi.id} {...kpi} uppercaseLabel />
        ))}
      </div>

      <AppointmentsChart dailyAppointments={dailyAppointments} />

      <UpcomingAppointmentsTable appointments={upcomingAppointments} onStatusChange={handleStatusChange} />
    </div>
  );
}
