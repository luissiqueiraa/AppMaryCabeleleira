// Granularidade da grade de horários — não é configurável pelo admin (as
// configurações do salão só guardam abertura/fechamento por dia). A grade é
// só a régua de início: o horário que o atendimento ocupa de fato vem da
// duração somada dos serviços escolhidos.
const SLOT_INTERVAL_MINUTES = 15;

const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function parseHour(hhmm) {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

export function weekdayIdForDate(dateIso) {
  const date = new Date(`${dateIso}T00:00:00`);
  return WEEKDAY_IDS[date.getDay()];
}

export function findDayHours(hours, dateIso) {
  const dayId = weekdayIdForDate(dateIso);
  return hours?.find((day) => day.id === dayId) ?? null;
}

export function generateDaySlots(dayHours) {
  if (!dayHours || !dayHours.enabled || !dayHours.open || !dayHours.close) return [];

  const openMinutes = parseHour(dayHours.open);
  const closeMinutes = parseHour(dayHours.close);
  const slots = [];
  for (let minutes = openMinutes; minutes + SLOT_INTERVAL_MINUTES <= closeMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const mm = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return slots;
}

export function hourRangeForDay(dayHours) {
  if (!dayHours || !dayHours.enabled || !dayHours.open || !dayHours.close) return [];
  const openHour = Number(dayHours.open.split(":")[0]);
  const closeHour = Number(dayHours.close.split(":")[0]);
  return Array.from({ length: Math.max(0, closeHour - openHour) }, (_, index) => openHour + index);
}

// Último horário em que um atendimento de `durationMinutes` ainda termina antes
// de o salão fechar. Null quando não cabe nenhum horário no dia — é o que a
// tela usa para explicar à cliente que ela precisa de outro dia.
export function latestStartTime(dayHours, durationMinutes) {
  if (!dayHours?.enabled || !dayHours.open || !dayHours.close) return null;

  const limite = parseHour(dayHours.close) - (durationMinutes || 0);
  if (limite < parseHour(dayHours.open)) return null;

  // Alinha ao passo da grade: o último horário tem de ser um slot de verdade.
  const passos = Math.floor((limite - parseHour(dayHours.open)) / SLOT_INTERVAL_MINUTES);
  const minutos = parseHour(dayHours.open) + passos * SLOT_INTERVAL_MINUTES;
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

// Marca como indisponível todo slot que colide com um agendamento ativo do
// profissional (considerando a duração somada dos serviços escolhidos), que já
// passou (se a data for hoje) ou cujo atendimento terminaria depois de o salão
// fechar — ninguém fica no salão depois da hora.
export function computeUnavailableTimes({ date, slots, bookedAppointments, durationMinutes, closeTime }) {
  const unavailable = new Set();
  const now = new Date();
  const closeMinutes = closeTime ? parseHour(closeTime) : null;

  for (const time of slots) {
    const slotStart = new Date(`${date}T${time}:00`);

    if (slotStart <= now) {
      unavailable.add(time);
      continue;
    }

    // O atendimento tem de terminar antes do fechamento.
    if (closeMinutes !== null && parseHour(time) + (durationMinutes ?? 0) > closeMinutes) {
      unavailable.add(time);
      continue;
    }

    // Enquanto nenhum serviço foi escolhido não dá para saber quanto tempo o
    // atendimento vai ocupar — mas um horário que começa dentro do
    // procedimento de outra cliente já está ocupado, e a grade precisa mostrar
    // isso. Por isso o mínimo é um instante, nunca "sem checagem".
    const slotEnd = new Date(slotStart.getTime() + Math.max(durationMinutes ?? 0, 1) * 60000);
    const conflicts = bookedAppointments.some((appt) => {
      const apptStart = new Date(appt.scheduledAt);
      const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60000);
      return slotStart < apptEnd && apptStart < slotEnd;
    });
    if (conflicts) unavailable.add(time);
  }

  return unavailable;
}
