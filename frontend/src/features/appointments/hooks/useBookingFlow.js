import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listServices } from "../services/serviceCatalogService";
import { listEmployees } from "../../employees/services/employeeService";
import { createAppointment, getAvailability } from "../../dashboard/services/appointmentService";
import { getSettings } from "../../../shared/services/settingsService";
import { generateDaySlots, computeUnavailableTimes, findDayHours } from "../utils/availability";
import { toLocalIsoDate } from "../../../shared/utils/formatDate";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

function formatDateLabel(iso) {
  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${day} ${month}`;
}

export function useBookingFlow() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [hours, setHours] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [professionalId, setProfessionalId] = useState(null);
  const [date, setDate] = useState(() => toLocalIsoDate(new Date()));
  const [time, setTime] = useState(null);
  const [payOnSite, setPayOnSite] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("idle");
  const [availabilityResult, setAvailabilityResult] = useState({ key: null, unavailableTimes: new Set() });

  useEffect(() => {
    let isMounted = true;
    Promise.all([listServices(), listEmployees(), getSettings()])
      .then(([servicesRes, employeesRes, settingsRes]) => {
        if (!isMounted) return;
        setServices(servicesRes.data);
        setProfessionals(employeesRes.data);
        setHours(settingsRes.data.hours);
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
  const professional = professionalId ? professionals.find((item) => item.id === professionalId) : null;
  const professionalName = professional?.user.fullName;

  const slots = generateDaySlots(findDayHours(hours, date));
  const availabilityKey = date && professionalId ? `${professionalId}|${date}` : null;

  useEffect(() => {
    if (!availabilityKey) return;
    let isMounted = true;
    getAvailability({ employeeId: professionalId, date })
      .then(({ data }) => {
        if (!isMounted) return;
        setAvailabilityResult({
          key: availabilityKey,
          unavailableTimes: computeUnavailableTimes({ date, slots, bookedAppointments: data, durationMinutes: service?.duration }),
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
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await createAppointment({
        serviceId,
        employeeId: professionalId,
        scheduledAt,
        payOnSite,
        notes: notes || undefined,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      toast.error(getErrorMessage(err, "Não foi possível confirmar agora. Tente novamente em instantes."));
    }
  }

  return {
    step,
    setStep,
    goBack,
    services,
    professionals,
    hours,
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
