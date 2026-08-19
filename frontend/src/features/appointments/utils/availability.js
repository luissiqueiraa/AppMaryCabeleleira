import { BUSINESS_HOURS } from "../../../shared/config/businessHours";

export function generateDaySlots() {
  const { openHour, closeHour, slotIntervalMinutes, lunchBreak } = BUSINESS_HOURS;
  const slots = [];
  for (let minutes = openHour * 60; minutes + slotIntervalMinutes <= closeHour * 60; minutes += slotIntervalMinutes) {
    const hour = Math.floor(minutes / 60);
    if (lunchBreak && hour >= lunchBreak.startHour && hour < lunchBreak.endHour) continue;
    const mm = minutes % 60;
    slots.push(`${String(hour).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return slots;
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
