// Granularidade da grade de horários — não é configurável pelo admin (as
// configurações do salão só guardam abertura/fechamento por dia).
const SLOT_INTERVAL_MINUTES = 45;

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

// Marca como indisponível todo slot que colide com um agendamento ativo do
// profissional (considerando a duração do serviço sendo escolhido) ou que já
// passou, se a data selecionada for hoje.
export function computeUnavailableTimes({ date, slots, bookedAppointments, durationMinutes }) {
  const unavailable = new Set();
  const now = new Date();

  for (const time of slots) {
    const slotStart = new Date(`${date}T${time}:00`);

    if (slotStart <= now) {
      unavailable.add(time);
      continue;
    }

    if (!durationMinutes) continue;
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
    const conflicts = bookedAppointments.some((appt) => {
      const apptStart = new Date(appt.scheduledAt);
      const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60000);
      return slotStart < apptEnd && apptStart < slotEnd;
    });
    if (conflicts) unavailable.add(time);
  }

  return unavailable;
}
