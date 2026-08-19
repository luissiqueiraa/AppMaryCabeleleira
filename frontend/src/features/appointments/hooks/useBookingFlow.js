import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listServices } from "../services/serviceCatalogService";
import { listEmployees } from "../../employees/services/employeeService";
import { NO_PREFERENCE } from "../components/ProfessionalList";
import { createAppointment, listAppointments } from "../../dashboard/services/appointmentService";
import { generateDaySlots, computeUnavailableTimes } from "../utils/availability";
import { toLocalIsoDate } from "../../../shared/utils/formatDate";

function formatDateLabel(iso) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${month}`;
}

export function useBookingFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [professionalId, setProfessionalId] = useState(null);
  const [date, setDate] = useState(() => toLocalIsoDate(new Date()));
  const [time, setTime] = useState(null);
  const [payOnSite, setPayOnSite] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState({ key: null, unavailableTimes: new Set() });

  useEffect(() => {
    let isMounted = true;
    Promise.all([listServices(), listEmployees()])
      .then(([servicesRes, employeesRes]) => {
        if (!isMounted) return;
        setServices(servicesRes.data);
        setProfessionals(employeesRes.data);
        setIsLoadingCatalog(false);
      })
      .catch(() => {
        if (isMounted) {
          setCatalogError(true);
          setIsLoadingCatalog(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const service = services.find((item) => item.id === serviceId) ?? null;
  const professional =
    professionalId && professionalId !== NO_PREFERENCE
      ? professionals.find((item) => item.id === professionalId)
      : null;
  const professionalName =
    professionalId === NO_PREFERENCE ? "a profissional disponível" : professional?.user.fullName;

  const slots = generateDaySlots();
  const hasSpecificProfessional = Boolean(date && professionalId && professionalId !== NO_PREFERENCE);
  const availabilityKey = hasSpecificProfessional ? `${professionalId}|${date}` : null;

  useEffect(() => {
    if (!availabilityKey) return;
    let isMounted = true;
    listAppointments({ employeeId: professionalId, date })
      .then(({ data }) => {
        if (!isMounted) return;
        const active = data.filter((item) => item.status === "pending" || item.status === "confirmed");
        setAvailabilityResult({
          key: availabilityKey,
          unavailableTimes: computeUnavailableTimes({ date, slots, bookedAppointments: active, durationMinutes: service?.duration }),
        });
      })
      .catch(() => {
        if (isMounted) setAvailabilityResult({ key: availabilityKey, unavailableTimes: new Set() });
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, service?.duration]);

  const isLoadingAvailability = Boolean(availabilityKey) && availabilityResult.key !== availabilityKey;
  const unavailableTimes = !availabilityKey
    ? computeUnavailableTimes({ date, slots, bookedAppointments: [], durationMinutes: service?.duration })
    : availabilityResult.key === availabilityKey
      ? availabilityResult.unavailableTimes
      : new Set();

  const dateLabel = date ? formatDateLabel(date) : null;
  const isComplete = Boolean(service && professionalId && date && time);

  function goBack() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  }

  async function confirm() {
    setStatus("loading");
    setError("");
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await createAppointment({
        serviceId,
        employeeId: professionalId === NO_PREFERENCE ? null : professionalId,
        scheduledAt,
        payOnSite,
        notes: notes || undefined,
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Não foi possível confirmar agora. Tente novamente em instantes.");
    }
  }

  return {
    step,
    setStep,
    goBack,
    services,
    professionals,
    isLoadingCatalog,
    catalogError,
    service,
    professionalId,
    professional,
    professionalName,
    date,
    dateLabel,
    time,
    payOnSite,
    notes,
    isComplete,
    status,
    error,
    slots,
    unavailableTimes,
    isLoadingAvailability,
    selectService: (item) => setServiceId(item.id),
    selectProfessional: setProfessionalId,
    selectDate: setDate,
    selectTime: setTime,
    setPayOnSite,
    setNotes,
    confirm,
  };
}
