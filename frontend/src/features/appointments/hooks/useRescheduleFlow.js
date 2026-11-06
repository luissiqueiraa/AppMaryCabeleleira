import { useEffect, useState } from "react";
import { getAppointment, rescheduleAppointment, getAvailability } from "../../dashboard/services/appointmentService";
import { getSettings } from "../../../shared/services/settingsService";
import { generateDaySlots, computeUnavailableTimes, findDayHours, latestStartTime } from "../utils/availability";
import { toLocalIsoDate } from "../../../shared/utils/formatDate";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

export const NON_RESCHEDULABLE_STATUSES = ["completed", "cancelled"];

// Escolher a nova data de um agendamento. Usado pela tela da cliente e pelo
// painel (quando a cliente liga pedindo para mudar) — as regras de horário
// livre, expediente e fechamento ficam num lugar só.
export function useRescheduleFlow(appointmentId, { onSuccess } = {}) {
  const toast = useToast();

  const [appointment, setAppointment] = useState(null);
  const [hours, setHours] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState({ key: null, unavailableTimes: new Set() });
  const [submitStatus, setSubmitStatus] = useState("idle");

  const dayHours = findDayHours(hours, date);
  const slots = generateDaySlots(dayHours);
  const closeTime = dayHours?.close;
  const durationMinutes = appointment?.durationMinutes ?? 0;

  useEffect(() => {
    if (!appointmentId) return;
    let isMounted = true;
    // O estado já nasce em "loading" e cada agendamento usa sua própria
    // instância (a tela remonta, o modal também), então não é preciso
    // reiniciá-lo aqui.
    Promise.all([getAppointment(appointmentId), getSettings()])
      .then(([appointmentRes, settingsRes]) => {
        if (!isMounted) return;
        const data = appointmentRes.data;
        setAppointment(data);
        setHours(settingsRes.data.hours);
        // Começa no horário atual do agendamento: quem remarca costuma mexer
        // pouco, e assim a grade já abre no dia certo.
        const scheduled = new Date(data.scheduledAt);
        setDate(toLocalIsoDate(scheduled));
        setTime(scheduled.toTimeString().slice(0, 5));
        setLoadStatus("success");
      })
      .catch(() => {
        if (isMounted) setLoadStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const hasEmployee = Boolean(appointment && date && appointment.employee);
  const availabilityKey = hasEmployee ? `${appointment.employee.id}|${date}` : null;

  useEffect(() => {
    if (!availabilityKey) return;
    let isMounted = true;

    // excludeId: o próprio agendamento não pode bloquear o horário dele mesmo.
    getAvailability({ employeeId: appointment.employee.id, date, excludeId: appointment.id })
      .then(({ data }) => {
        if (!isMounted) return;
        setAvailabilityResult({
          key: availabilityKey,
          unavailableTimes: computeUnavailableTimes({
            date,
            slots,
            bookedAppointments: data,
            durationMinutes,
            closeTime,
          }),
        });
      })
      .catch(() => {
        if (isMounted) setAvailabilityResult({ key: availabilityKey, unavailableTimes: new Set() });
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, closeTime, durationMinutes]);

  const isLoadingAvailability = Boolean(availabilityKey) && availabilityResult.key !== availabilityKey;
  const unavailableTimes = !availabilityKey
    ? computeUnavailableTimes({ date, slots, bookedAppointments: [], durationMinutes, closeTime })
    : availabilityResult.key === availabilityKey
      ? availabilityResult.unavailableTimes
      : new Set();

  // Um horário escolhido pode ser ocupado por outra cliente antes de confirmar.
  const selectedTime = time && !unavailableTimes.has(time) ? time : null;

  function selectDate(newDate) {
    setDate(newDate);
    setTime(null);
  }

  async function submit() {
    setSubmitStatus("loading");
    try {
      const scheduledAt = new Date(`${date}T${selectedTime}:00`).toISOString();
      await rescheduleAppointment(appointmentId, { scheduledAt });
      toast.success("Agendamento remarcado com sucesso.");
      setSubmitStatus("success");
      onSuccess?.();
    } catch (err) {
      setSubmitStatus("error");
      toast.error(getErrorMessage(err, "Não foi possível remarcar agora. Tente novamente em instantes."));
    }
  }

  return {
    appointment,
    hours,
    loadStatus,
    date,
    time: selectedTime,
    slots,
    unavailableTimes,
    isLoadingAvailability,
    durationMinutes,
    latestStart: latestStartTime(dayHours, durationMinutes),
    canSubmit: Boolean(date && selectedTime) && submitStatus !== "loading",
    isSubmitting: submitStatus === "loading",
    canReschedule: appointment ? !NON_RESCHEDULABLE_STATUSES.includes(appointment.status) : false,
    selectDate,
    selectTime: setTime,
    submit,
  };
}
