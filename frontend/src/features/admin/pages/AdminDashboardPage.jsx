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
import { useAppointmentChanges } from "../realtime/AppointmentEventsContext";

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

  // Tempo real: qualquer mudança de agendamento (de cliente ou colega)
  // recarrega cards, histórico e próximos — sem "Carregando...", a tela só
  // troca os dados.
  useAppointmentChanges(() => setRefreshToken((n) => n + 1));

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

  // Fica na lista o que ainda vai acontecer e o que é de hoje e continua em
  // aberto: um horário que acabou de passar precisa do botão "Concluir" à mão,
  // e não sumir da tela. Dias anteriores se concluem pelo histórico.
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(
      (item) =>
        item.status !== "cancelled" &&
        (new Date(item.scheduledAt) >= now ||
          (isoDate(new Date(item.scheduledAt)) === todayIso && ["pending", "confirmed"].includes(item.status)))
    )
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  return (
    <div className="space-y-6">
      {/* Cinco cartões. Em telas médias quebram em duas linhas em vez de
          encolherem até o valor não caber. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Agendamentos hoje" value={String(todayAppointments.length)} uppercaseLabel />
        <KpiCard label="Confirmados" value={String(confirmedToday.length)} uppercaseLabel />
        {/* "Recebido" é o dinheiro que entrou de fato: todo pagamento
            confirmado (pix, cartão ou presencial), menos cancelados. */}
        {/* Cancelado depois de pago fica fora do recebido; o aviso lembra que
            há dinheiro para devolver (botão "Estornar valor" no histórico). */}
        <KpiCard
          label="Recebido"
          value={formatBRL(revenue?.total ?? 0)}
          hint={revenue?.refundDue ? `${formatBRL(revenue.refundDue)} a devolver (cancelados)` : undefined}
          hintTone="warning"
          uppercaseLabel
        />
        {/* Parte do recebido que é de horário futuro: já está na conta, mas
            volta para a cliente se ela cancelar. */}
        <KpiCard
          label="Pago adiantado"
          value={formatBRL(revenue?.prepaid ?? 0)}
          hint={revenue?.prepaid ? "Incluído no recebido, atendimento por vir" : undefined}
          hintTone="positive"
          uppercaseLabel
        />
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
        reloadKey={refreshToken}
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
