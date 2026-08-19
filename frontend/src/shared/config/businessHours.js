// Sem domínio de Configurações ainda (fase futura) — horário de funcionamento
// fixo por enquanto, compartilhado entre o fluxo de agendamento e a agenda do
// admin.
export const BUSINESS_HOURS = {
  openHour: 9,
  closeHour: 19,
  slotIntervalMinutes: 45,
  lunchBreak: { startHour: 12, endHour: 13 },
  closedWeekdays: [0], // domingo
};

export const BUSINESS_HOURS_LIST = Array.from(
  { length: BUSINESS_HOURS.closeHour - BUSINESS_HOURS.openHour },
  (_, index) => BUSINESS_HOURS.openHour + index
);
