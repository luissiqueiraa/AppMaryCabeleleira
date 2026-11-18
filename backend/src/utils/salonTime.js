import { env } from "../config/env.js";

// O banco guarda instantes (UTC); o salão vive em hora de parede no fuso dele.
// O servidor roda em UTC (container, Railway), então nada de new Date("...T00:00")
// nem setHours: isso daria a meia-noite de Londres, não a do salão. Tudo que
// fala de "dia" passa por aqui.

const pad = (value) => String(value).padStart(2, "0");

// Diferença, em minutos, entre a hora de parede do fuso e o UTC naquele instante.
// Respeita horário de verão, porque é calculada para o instante pedido.
function offsetMinutes(instant, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value])
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

// Instante da meia-noite (hora do salão) do dia "YYYY-MM-DD".
export function salonDayStart(isoDate, timeZone = env.salonTimeZone) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day);
  let result = guess - offsetMinutes(new Date(guess), timeZone) * 60000;
  // Se o fuso mudou de deslocamento entre o palpite e o resultado (dia de
  // virada do horário de verão), recalcula com o deslocamento certo.
  result = guess - offsetMinutes(new Date(result), timeZone) * 60000;
  return new Date(result);
}

// "YYYY-MM-DD" do dia seguinte, sem passar por fuso nenhum.
export function nextIsoDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

// Data e hora para texto de notificação: "17/11/2026 às 14:30", no fuso do salão.
export function formatSalonDateTime(instant, timeZone = env.salonTimeZone) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(instant);
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);
  return `${date} às ${time}`;
}
