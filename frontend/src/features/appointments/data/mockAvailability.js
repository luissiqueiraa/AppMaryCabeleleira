import { toLocalIsoDate } from "../../../shared/utils/formatDate";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function getAvailableDays(hours, daysAhead = 7) {
  const today = new Date();

  return Array.from({ length: daysAhead }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const dayHours = hours?.find((day) => day.id === WEEKDAY_IDS[date.getDay()]);

    return {
      iso: toLocalIsoDate(date),
      weekday: WEEKDAY_LABELS[date.getDay()],
      day: date.getDate(),
      monthLabel: `${MONTH_LABELS[date.getMonth()]}, ${date.getFullYear()}`,
      disabled: !dayHours?.enabled,
    };
  });
}
