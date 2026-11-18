// O servidor roda em UTC e o salão em America/Sao_Paulo. Estes testes não
// dependem do fuso da máquina: passam igual no container, no Railway e no
// computador de quem desenvolve.
import { jest } from "@jest/globals";
import { salonDayStart, nextIsoDate, formatSalonDateTime } from "../../src/utils/salonTime.js";

const SP = "America/Sao_Paulo";

describe("salonDayStart", () => {
  it("meia-noite em São Paulo é 03:00 UTC", () => {
    expect(salonDayStart("2026-11-17", SP).toISOString()).toBe("2026-11-17T03:00:00.000Z");
  });

  it("respeita fuso com horário de verão (Nova York, inverno e verão)", () => {
    expect(salonDayStart("2026-01-15", "America/New_York").toISOString()).toBe("2026-01-15T05:00:00.000Z");
    expect(salonDayStart("2026-07-15", "America/New_York").toISOString()).toBe("2026-07-15T04:00:00.000Z");
  });
});

describe("nextIsoDate", () => {
  it("vira mês e ano", () => {
    expect(nextIsoDate("2026-11-30")).toBe("2026-12-01");
    expect(nextIsoDate("2026-12-31")).toBe("2027-01-01");
    expect(nextIsoDate("2028-02-28")).toBe("2028-02-29");
  });
});

describe("formatSalonDateTime", () => {
  it("mostra data e hora do salão, não do servidor", () => {
    // 00:30 UTC do dia 18 ainda é 21:30 do dia 17 em São Paulo.
    expect(formatSalonDateTime(new Date("2026-11-18T00:30:00.000Z"), SP)).toBe("17/11/2026 às 21:30");
  });
});

// Filtro do histórico: "de 17/11 até 17/11" precisa trazer o dia 17 inteiro.
describe("listAppointments — intervalo de datas", () => {
  const findAppointments = jest.fn().mockResolvedValue([]);
  jest.unstable_mockModule("../../src/repositories/appointments.repository.js", () => ({
    findAppointments,
    countAppointments: jest.fn().mockResolvedValue(0),
    findActiveAppointmentsForEmployeeOnDay: jest.fn().mockResolvedValue([]),
  }));
  jest.unstable_mockModule("../../src/repositories/services.repository.js", () => ({ findServicesByIds: jest.fn() }));
  jest.unstable_mockModule("../../src/repositories/employees.repository.js", () => ({ findEmployeeById: jest.fn() }));
  jest.unstable_mockModule("../../src/repositories/settings.repository.js", () => ({ findSettings: jest.fn() }));
  jest.unstable_mockModule("../../src/services/notifications.service.js", () => ({ notifyUser: jest.fn() }));
  jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));

  const admin = { id: "admin-1", permissions: ["manage_appointments"] };

  it("'até' é inclusivo: um dia só cobre da meia-noite à meia-noite do salão", async () => {
    const { listAppointments } = await import("../../src/services/appointments.service.js");
    await listAppointments(admin, { from: "2026-11-17", to: "2026-11-17" });

    const { dateFrom, dateTo } = findAppointments.mock.calls.at(-1)[0];
    expect(dateFrom.toISOString()).toBe("2026-11-17T03:00:00.000Z");
    expect(dateTo.toISOString()).toBe("2026-11-18T03:00:00.000Z");
  });

  it("'date' (agenda do dia) usa o mesmo dia do salão", async () => {
    const { listAppointments } = await import("../../src/services/appointments.service.js");
    await listAppointments(admin, { date: "2026-11-17" });

    const { dateFrom, dateTo } = findAppointments.mock.calls.at(-1)[0];
    expect(dateFrom.toISOString()).toBe("2026-11-17T03:00:00.000Z");
    expect(dateTo.toISOString()).toBe("2026-11-18T03:00:00.000Z");
  });
});
