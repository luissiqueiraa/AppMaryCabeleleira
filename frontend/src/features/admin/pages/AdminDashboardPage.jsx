import { useEffect, useState } from "react";
import KpiCard from "../../dashboard/components/KpiCard";
import UpcomingAppointmentsTable from "../components/UpcomingAppointmentsTable";
import AppointmentsHistory from "../components/AppointmentsHistory";
import { listAppointments, getRevenueSummary, cancelAppointment } from "../../dashboard/services/appointmentService";
import { updateAppointmentStatus, deleteAppointment } from "../services/adminAppointmentService";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import RescheduleAppointmentModal from "../components/RescheduleAppointmentModal";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLES } from "../../../shared/constants/roles";
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
  const [revenue, setRevenue] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [refreshToken, setRefreshToken] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  // Mesma regra do backend: funcionária cancela, não apaga.
  const canDelete = [ROLES.OWNER, ROLES.ADMIN].includes(user?.role?.name);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const from = isoDate(startOfDay(new Date()));
      try {
        // O caixa vem somado do backend: o painel carrega só a agenda de hoje
        // em diante, e o total acumulado está fora dessa janela.
        const [appointmentsRes, revenueRes] = await Promise.all([
          listAppointments({ from }),
          getRevenueSummary(),
        ]);
        if (isMounted) {
          setAppointments(appointmentsRes.data.map(mapAppointment));
          setRevenue(revenueRes.data);
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

  // Excluir é para erro de lançamento. O agendamento sai das listas e do caixa,
  // então a confirmação diz isso antes.
  // Cancelar é o caminho de "a cliente desmarcou": libera o horário e mantém o
  // agendamento no histórico. Excluir é outra coisa, e fica no mesmo menu.
  async function handleConfirmCancel() {
    setIsCancelling(true);
    try {
      await cancelAppointment(cancelTarget.id);
      toast.success("Agendamento cancelado.");
      setCancelTarget(null);
      setRefreshToken((n) => n + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível cancelar o agendamento agora."));
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await deleteAppointment(deleteTarget.id);
      toast.success("Agendamento excluído.");
      setDeleteTarget(null);
      setRefreshToken((n) => n + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível excluir o agendamento agora."));
    } finally {
      setIsDeleting(false);
    }
  }

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

  const now = new Date();
  const upcomingAppointments = appointments
    .filter((item) => new Date(item.scheduledAt) >= now && item.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Agendamentos hoje" value={String(todayAppointments.length)} uppercaseLabel />
        <KpiCard label="Confirmados" value={String(confirmedToday.length)} uppercaseLabel />
        {/* "Recebido" é dinheiro na mão: atendimento concluído E pagamento
            confirmado. O que foi atendido sem pagar, e o que está agendado para
            frente, aparece em "A receber". */}
        <KpiCard label="Recebido" value={formatBRL(revenue?.total ?? 0)} uppercaseLabel />
        <KpiCard
          label="A receber"
          value={formatBRL(revenue?.pending ?? 0)}
          hint={revenue?.pending ? "Confirme no histórico ao receber" : undefined}
          hintTone="warning"
          uppercaseLabel
        />
      </div>

      {/* Dar baixa num pagamento muda o caixa, então o painel recarrega. */}
      <AppointmentsHistory
        onPaymentChange={() => setRefreshToken((n) => n + 1)}
        onRequestReschedule={setRescheduleTarget}
      />

      <UpcomingAppointmentsTable
        appointments={upcomingAppointments}
        onStatusChange={handleStatusChange}
        onRequestDelete={canDelete ? setDeleteTarget : undefined}
        onRequestCancel={setCancelTarget}
        onRequestReschedule={setRescheduleTarget}
      />

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir este agendamento?"
        description={
          deleteTarget
            ? `${deleteTarget.service} de ${deleteTarget.client} em ${deleteTarget.dateShort} às ${deleteTarget.time}. Ele sai das listas e do caixa, e não dá para desfazer. Se a cliente desmarcou, use cancelar em vez de excluir.`
            : ""
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Voltar"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Remarcar pelo painel: a cliente liga pedindo para mudar e a equipe
          resolve sem sair do dashboard. */}
      {rescheduleTarget && (
        <RescheduleAppointmentModal
          appointmentId={rescheduleTarget.id}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={() => setRefreshToken((n) => n + 1)}
        />
      )}

      <ConfirmationModal
        open={Boolean(cancelTarget)}
        title="Cancelar este agendamento?"
        description={
          cancelTarget
            ? `${cancelTarget.service} de ${cancelTarget.client} em ${cancelTarget.dateShort} às ${cancelTarget.time}. O horário fica livre para outra cliente e o agendamento continua no histórico como cancelado.`
            : ""
        }
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
