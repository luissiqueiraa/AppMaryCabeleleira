import { useEffect, useState } from "react";
import ScheduleToolbar from "../components/ScheduleToolbar";
import ScheduleGrid from "../components/ScheduleGrid";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { listEmployees } from "../../employees/services/employeeService";
import { listAppointments, cancelAppointment } from "../../dashboard/services/appointmentService";
import { updateAppointmentStatus } from "../services/adminAppointmentService";
import { getSettings } from "../../../shared/services/settingsService";
import { hourRangeForDay, findDayHours } from "../../appointments/utils/availability";
import { formatFullDate, toLocalIsoDate as isoDate } from "../../../shared/utils/formatDate";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

function addDays(iso, amount) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

export default function AdminAppointmentsPage() {
  const toast = useToast();
  const [selectedDate, setSelectedDate] = useState(() => isoDate(new Date()));
  const [professionals, setProfessionals] = useState([]);
  const [events, setEvents] = useState([]);
  const [hours, setHours] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [refreshToken, setRefreshToken] = useState(0);

  const [detailTarget, setDetailTarget] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [employeesRes, appointmentsRes, settingsRes] = await Promise.all([
          listEmployees(),
          listAppointments({ date: selectedDate }),
          getSettings(),
        ]);
        if (!isMounted) return;

        setHours(settingsRes.data.hours);

        const activeAppointments = appointmentsRes.data.filter((item) => item.status !== "cancelled");
        const countByEmployee = activeAppointments.reduce((acc, item) => {
          if (item.employee) acc[item.employee.id] = (acc[item.employee.id] ?? 0) + 1;
          return acc;
        }, {});

        setProfessionals(
          employeesRes.data.map((employee) => ({
            id: employee.id,
            name: employee.user.fullName,
            avatarUrl: employee.user.avatarUrl,
            count: countByEmployee[employee.id] ?? 0,
          }))
        );

        setEvents(
          activeAppointments
            .filter((item) => item.employee)
            .map((item) => {
              const scheduled = new Date(item.scheduledAt);
              return {
                id: item.id,
                employeeId: item.employee.id,
                service: item.service.name,
                client: item.client.fullName,
                phone: item.client.phoneNumber,
                professional: item.employee.fullName,
                status: item.status,
                notes: item.notes,
                price: item.price,
                scheduledAt: item.scheduledAt,
                durationMinutes: item.durationMinutes,
                date: isoDate(scheduled),
                startHour: scheduled.getHours(),
                rowSpan: Math.max(1, Math.round(item.durationMinutes / 60)),
              };
            })
        );

        setLoadStatus("success");
      } catch {
        if (isMounted) setLoadStatus("error");
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [selectedDate, refreshToken]);

  async function handleStatusChange(id, status) {
    setIsUpdating(true);
    try {
      await updateAppointmentStatus(id, status);
      toast.success(status === "completed" ? "Atendimento concluído." : "Agendamento atualizado.");
      setDetailTarget(null);
      setRefreshToken((n) => n + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível atualizar agora. Tente novamente em instantes."));
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleConfirmCancel() {
    setIsUpdating(true);
    try {
      await cancelAppointment(cancelTarget);
      toast.success("Agendamento cancelado.");
      setCancelTarget(null);
      setDetailTarget(null);
      setRefreshToken((n) => n + 1);
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível cancelar agora. Tente novamente em instantes."));
    } finally {
      setIsUpdating(false);
    }
  }

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar a agenda agora. Tente novamente em instantes.
      </p>
    );
  }

  const dayHours = findDayHours(hours, selectedDate);
  const hourRange = hourRangeForDay(dayHours);

  return (
    <div className="space-y-4">
      <ScheduleToolbar
        dateLabel={formatFullDate(selectedDate)}
        onPrevDay={() => setSelectedDate((prev) => addDays(prev, -1))}
        onNextDay={() => setSelectedDate((prev) => addDays(prev, 1))}
        onToday={() => setSelectedDate(isoDate(new Date()))}
      />

      {loadStatus === "loading" ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : hourRange.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          O salão não abre nesse dia.
        </p>
      ) : (
        <ScheduleGrid
          professionals={professionals}
          hours={hourRange}
          events={events}
          onSelectEvent={setDetailTarget}
        />
      )}

      <AppointmentDetailModal
        appointment={detailTarget}
        isUpdating={isUpdating}
        onClose={() => setDetailTarget(null)}
        onStatusChange={handleStatusChange}
        onRequestCancel={setCancelTarget}
      />

      <ConfirmationModal
        open={Boolean(cancelTarget)}
        title="Cancelar agendamento"
        description="Tem certeza que deseja cancelar este agendamento? Essa ação não pode ser desfeita."
        confirmLabel="Sim, cancelar"
        cancelLabel="Voltar"
        isLoading={isUpdating}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
