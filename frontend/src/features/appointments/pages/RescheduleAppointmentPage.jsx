import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DateTimeSection from "../components/DateTimeSection";
import { getAppointment, rescheduleAppointment, listAppointments } from "../../dashboard/services/appointmentService";
import { generateDaySlots, computeUnavailableTimes } from "../utils/availability";
import { toLocalIsoDate } from "../../../shared/utils/formatDate";

const NON_RESCHEDULABLE_STATUSES = ["completed", "cancelled"];

export default function RescheduleAppointmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState({ key: null, unavailableTimes: new Set() });
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [error, setError] = useState("");

  const slots = generateDaySlots();

  useEffect(() => {
    getAppointment(id)
      .then(({ data }) => {
        setAppointment(data);
        const scheduled = new Date(data.scheduledAt);
        setDate(toLocalIsoDate(scheduled));
        setTime(scheduled.toTimeString().slice(0, 5));
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }, [id]);

  const hasEmployee = Boolean(appointment && date && appointment.employee);
  const availabilityKey = hasEmployee ? `${appointment.employee.id}|${date}` : null;

  useEffect(() => {
    if (!availabilityKey) return;
    let isMounted = true;
    listAppointments({ employeeId: appointment.employee.id, date })
      .then(({ data }) => {
        if (!isMounted) return;
        const active = data.filter(
          (item) => item.id !== appointment.id && (item.status === "pending" || item.status === "confirmed")
        );
        setAvailabilityResult({
          key: availabilityKey,
          unavailableTimes: computeUnavailableTimes({ date, slots, bookedAppointments: active, durationMinutes: appointment.durationMinutes }),
        });
      })
      .catch(() => {
        if (isMounted) setAvailabilityResult({ key: availabilityKey, unavailableTimes: new Set() });
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey]);

  const isLoadingAvailability = Boolean(availabilityKey) && availabilityResult.key !== availabilityKey;
  const unavailableTimes = !availabilityKey
    ? computeUnavailableTimes({ date, slots, bookedAppointments: [], durationMinutes: appointment?.durationMinutes })
    : availabilityResult.key === availabilityKey
      ? availabilityResult.unavailableTimes
      : new Set();

  async function handleSubmit() {
    setSubmitStatus("loading");
    setError("");
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await rescheduleAppointment(id, { scheduledAt });
      navigate(`/appointments/${id}`);
    } catch {
      setSubmitStatus("error");
      setError("Não foi possível remarcar agora. Tente novamente em instantes.");
    }
  }

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error" || !appointment) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Agendamento não encontrado.</p>
        <Link to="/appointments" className="mt-3 inline-block text-sm font-semibold text-pink-600 hover:underline">
          Voltar para agendamentos
        </Link>
      </div>
    );
  }

  if (NON_RESCHEDULABLE_STATUSES.includes(appointment.status)) {
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
    <div className="mx-auto max-w-xl space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-xl font-semibold text-gray-900">Remarcar {appointment.service.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          com {appointment.employee?.fullName ?? "Sem preferência"}
        </p>
      </div>

      <DateTimeSection
        selectedDate={date}
        selectedTime={time}
        onSelectDate={(newDate) => {
          setDate(newDate);
          setTime(null);
        }}
        onSelectTime={setTime}
        slots={slots}
        unavailableTimes={unavailableTimes}
        isLoadingAvailability={isLoadingAvailability}
      />

      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!date || !time || submitStatus === "loading"}
          className="flex-1 rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitStatus === "loading" ? "Remarcando..." : "Confirmar nova data"}
        </button>
        <Link
          to={`/appointments/${id}`}
          className="flex-1 rounded-lg border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
      </div>
    </div>
  );
}
