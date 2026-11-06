import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listServices } from "../services/serviceCatalogService";
import { listEmployees } from "../../employees/services/employeeService";
import { createAppointment, getAvailability } from "../../dashboard/services/appointmentService";
import { getSettings } from "../../../shared/services/settingsService";
import { createPayment, getPayment } from "../services/paymentService";
import { generateDaySlots, computeUnavailableTimes, findDayHours, latestStartTime } from "../utils/availability";
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
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [hours, setHours] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  // A cliente pode marcar vários procedimentos de uma vez (corte + escova):
  // o horário reservado é a soma das durações e o total, a soma dos preços.
  // "Repetir" no histórico manda os serviços do atendimento anterior pelo
  // endereço, já selecionados.
  const [serviceIds, setServiceIds] = useState(
    () => searchParams.get("servicos")?.split(",").filter(Boolean) ?? []
  );
  // Quem chega pela home clicando em "Agendar com <nome>" já vem com a
  // profissional escolhida no endereço — a etapa 2 começa resolvida.
  const [professionalId, setProfessionalId] = useState(() => searchParams.get("profissional"));
  const [date, setDate] = useState(() => toLocalIsoDate(new Date()));
  const [time, setTime] = useState(null);
  // Pagar no salão é o padrão: é o que sempre funcionou e não depende de
  // provedor configurado.
  const [paymentMethod, setPaymentMethod] = useState("on_site");
  const [onlinePaymentsEnabled, setOnlinePaymentsEnabled] = useState(false);
  const [payment, setPayment] = useState(null);
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
        setOnlinePaymentsEnabled(Boolean(settingsRes.data.onlinePaymentsEnabled));
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

  // Segue a ordem do catálogo, não a ordem em que a cliente foi clicando:
  // o resumo fica igual ao que ela acabou de ver na lista.
  const selectedServices = services.filter((item) => serviceIds.includes(item.id));
  const totalDuration = selectedServices.reduce((total, item) => total + item.duration, 0);
  const totalPrice = selectedServices.reduce((total, item) => total + item.price, 0);

  const professional = professionalId ? professionals.find((item) => item.id === professionalId) : null;
  const professionalName = professional?.user.fullName;

  const dayHours = findDayHours(hours, date);
  const slots = generateDaySlots(dayHours);
  const closeTime = dayHours?.close;
  const availabilityKey = date && professionalId ? `${professionalId}|${date}` : null;

  useEffect(() => {
    if (!availabilityKey) return;
    let isMounted = true;
    getAvailability({ employeeId: professionalId, date })
      .then(({ data }) => {
        if (!isMounted) return;
        setAvailabilityResult({
          key: availabilityKey,
          unavailableTimes: computeUnavailableTimes({ date, slots, bookedAppointments: data, durationMinutes: totalDuration, closeTime }),
        });
      })
      .catch(() => {
        if (isMounted) setAvailabilityResult({ key: availabilityKey, unavailableTimes: new Set() });
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, totalDuration, closeTime]);

  const isLoadingAvailability = Boolean(availabilityKey) && availabilityResult.key !== availabilityKey;
  const unavailableTimes = !availabilityKey
    ? computeUnavailableTimes({ date, slots, bookedAppointments: [], durationMinutes: totalDuration, closeTime })
    : availabilityResult.key === availabilityKey
      ? availabilityResult.unavailableTimes
      : new Set();

  // O horário escolhido pode ser ocupado por outra cliente (ou simplesmente
  // passar, se for hoje) antes desta confirmar: nesse caso ele volta a contar
  // como "nenhum horário escolhido" em vez de seguir para um 409.
  const selectedTime = time && !unavailableTimes.has(time) ? time : null;

  const dateLabel = date ? formatDateLabel(date) : null;
  const isComplete = Boolean(selectedServices.length > 0 && professionalId && date && selectedTime);

  function goBack() {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  }

  async function confirm() {
    setStatus("loading");
    const scheduledAt = new Date(`${date}T${selectedTime}:00`).toISOString();
    const booking = {
      serviceIds: selectedServices.map((item) => item.id),
      employeeId: professionalId,
      scheduledAt,
      notes: notes || undefined,
    };

    try {
      // Pagar no salão agenda na hora. Pix e cartão cobram primeiro: o
      // agendamento só nasce quando o provedor confirma, então aqui a tela vai
      // para a espera (pix) ou para o checkout (cartão).
      if (paymentMethod === "on_site") {
        await createAppointment(booking);
        setStatus("success");
        return;
      }

      const { data } = await createPayment({ ...booking, method: paymentMethod });

      if (paymentMethod === "card") {
        if (!data.checkoutUrl) {
          throw new Error("checkout indisponível");
        }
        // Sai do app para o ambiente do Mercado Pago e volta em /payments/:id.
        window.location.assign(data.checkoutUrl);
        return;
      }

      setPayment(data);
      setStatus("awaitingPayment");
    } catch (err) {
      setStatus("error");
      toast.error(getErrorMessage(err, "Não foi possível confirmar agora. Tente novamente em instantes."));
    }
  }

  // Enquanto o pix não é confirmado, pergunta ao backend de tempo em tempo: o
  // webhook do provedor não chega em ambiente local, e em produção uma
  // notificação pode se perder.
  useEffect(() => {
    if (status !== "awaitingPayment" || !payment?.id || payment.status !== "pending") return;
    let isMounted = true;
    const intervalId = setInterval(async () => {
      try {
        const { data } = await getPayment(payment.id);
        if (!isMounted) return;
        setPayment(data);
        if (data.status === "paid") setStatus("success");
      } catch {
        // Falha de rede não derruba a espera: a próxima volta tenta de novo.
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [status, payment?.id, payment?.status]);

  function cancelPayment() {
    setPayment(null);
    setStatus("idle");
    setStep(3);
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
    selectedServices,
    totalDuration,
    totalPrice,
    professionalId,
    professional,
    professionalName,
    date,
    dateLabel,
    time: selectedTime,
    paymentMethod,
    onlinePaymentsEnabled,
    payment,
    notes,
    isComplete,
    status,
    slots,
    unavailableTimes,
    // Último horário que ainda termina antes do fechamento (null = não cabe).
    latestStart: latestStartTime(dayHours, totalDuration),
    isLoadingAvailability,
    toggleService: (item) =>
      setServiceIds((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      ),
    selectProfessional: setProfessionalId,
    selectDate: setDate,
    selectTime: setTime,
    setPaymentMethod,
    setNotes,
    confirm,
    cancelPayment,
  };
}
