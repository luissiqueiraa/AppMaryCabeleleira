import { toLocalIsoDate } from "../../../shared/utils/formatDate";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
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

export function getAvailableDays(daysAhead = 7) {
  const today = new Date();

  return Array.from({ length: daysAhead }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);

    return {
      iso: toLocalIsoDate(date),
      weekday: WEEKDAY_LABELS[date.getDay()],
      day: date.getDate(),
      monthLabel: `${MONTH_LABELS[date.getMonth()]}, ${date.getFullYear()}`,
      disabled: date.getDay() === 0,
    };
  });
}
