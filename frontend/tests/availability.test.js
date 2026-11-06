import { jest } from "@jest/globals";
import {
  generateDaySlots,
  computeUnavailableTimes,
  findDayHours,
  weekdayIdForDate,
  latestStartTime,
} from "../src/features/appointments/utils/availability.js";

const QUARTA = { id: "wed", label: "Quarta", enabled: true, open: "09:00", close: "19:00" };
const DOMINGO = { id: "sun", label: "Domingo", enabled: false, open: "", close: "" };
const HOURS = [DOMINGO, QUARTA];

// Dia distante, para o filtro de "horário que já passou" não interferir.
const DIA = "2027-12-15"; // quarta-feira

describe("grade de horários", () => {
  it("vai de 15 em 15 minutos", () => {
    const slots = generateDaySlots(QUARTA);

    expect(slots.slice(0, 4)).toEqual(["09:00", "09:15", "09:30", "09:45"]);
    const minutos = (t) => Number(t.split(":")[0]) * 60 + Number(t.split(":")[1]);
    const intervalos = new Set(slots.slice(1).map((t, i) => minutos(t) - minutos(slots[i])));
    expect([...intervalos]).toEqual([15]);
  });

  it("último horário é 15 min antes do fechamento", () => {
    expect(generateDaySlots(QUARTA).at(-1)).toBe("18:45");
  });

  it("dia fechado não tem horários", () => {
    expect(generateDaySlots(DOMINGO)).toEqual([]);
    expect(generateDaySlots(null)).toEqual([]);
  });

  it("encontra o expediente do dia da semana", () => {
    expect(weekdayIdForDate(DIA)).toBe("wed");
    expect(findDayHours(HOURS, DIA)).toBe(QUARTA);
    expect(findDayHours(HOURS, "2027-12-19")).toBe(DOMINGO);
  });
});

describe("horários indisponíveis", () => {
  const slots = generateDaySlots(QUARTA);
  // Atendimento de outra cliente: 16:30 às 18:30 (120 min).
  const ocupado = [{ scheduledAt: `${DIA}T16:30:00`, durationMinutes: 120 }];
  const bloqueados = (durationMinutes) => {
    const set = computeUnavailableTimes({ date: DIA, slots, bookedAppointments: ocupado, durationMinutes });
    return slots.filter((t) => set.has(t));
  };

  it("bloqueia todo o intervalo de um atendimento longo", () => {
    expect(bloqueados(30)).toEqual([
      "16:15", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15",
    ]);
  });

  // Regressão: antes, sem serviço escolhido a duração era 0 e a checagem era
  // pulada — a grade mostrava o dia inteiro livre mesmo com a agenda ocupada.
  it("bloqueia o intervalo ocupado mesmo sem serviço escolhido", () => {
    expect(bloqueados(0)).toEqual([
      "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15",
    ]);
    expect(bloqueados(undefined)).toContain("17:00");
  });

  it("quanto mais longo o serviço, mais cedo começa o bloqueio", () => {
    // 45 min às 16:00 terminaria 16:45, em cima do início (16:30).
    expect(bloqueados(45)[0]).toBe("16:00");
    // 90 min às 15:00 terminaria exatamente 16:30: encosta sem sobrepor, então
    // o primeiro bloqueado é 15:15.
    expect(bloqueados(90)[0]).toBe("15:15");
  });

  it("não bloqueia horário que termina exatamente quando o outro começa", () => {
    expect(bloqueados(30)).not.toContain("16:00"); // 16:00-16:30
  });

  it("não bloqueia horário que começa quando o outro termina", () => {
    expect(bloqueados(30)).not.toContain("18:30");
  });

  it("agenda vazia deixa tudo livre, menos o que não cabe até o fechamento", () => {
    const set = computeUnavailableTimes({
      date: DIA,
      slots,
      bookedAppointments: [],
      durationMinutes: 30,
      closeTime: QUARTA.close,
    });

    // 18:30 + 30 min fecha exatamente às 19:00; 18:45 passaria.
    expect(set.has("18:30")).toBe(false);
    expect(set.has("18:45")).toBe(true);
    expect([...set]).toEqual(["18:45"]);
  });

  describe("último horário que cabe até o fechamento", () => {
    it.each([
      [30, "18:30"],
      [45, "18:15"],
      [120, "17:00"],
      [600, "09:00"], // 10h: cabe exatamente no dia inteiro (09:00-19:00)
    ])("serviço de %i min -> %s", (durationMinutes, esperado) => {
      expect(latestStartTime(QUARTA, durationMinutes)).toBe(esperado);
    });

    it("devolve null quando nem o dia inteiro é suficiente", () => {
      expect(latestStartTime(QUARTA, 601)).toBeNull();
    });

    it("devolve null em dia fechado", () => {
      expect(latestStartTime(DOMINGO, 30)).toBeNull();
      expect(latestStartTime(null, 30)).toBeNull();
    });

    it("bloqueia todo o dia quando o atendimento não cabe", () => {
      const set = computeUnavailableTimes({
        date: DIA,
        slots,
        bookedAppointments: [],
        durationMinutes: 601,
        closeTime: QUARTA.close,
      });

      expect(set.size).toBe(slots.length);
    });
  });

  describe("quando o dia é hoje", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2027-12-15T13:40:00-03:00"));
    });
    afterEach(() => {
      jest.useRealTimers();
    });

    it("bloqueia horário que já passou", () => {
      const set = computeUnavailableTimes({ date: DIA, slots, bookedAppointments: [], durationMinutes: 30 });

      expect(set.has("09:00")).toBe(true);
      expect(set.has("13:30")).toBe(true);
      expect(set.has("13:45")).toBe(false);
      expect(set.has("18:00")).toBe(false);
    });
  });
});
