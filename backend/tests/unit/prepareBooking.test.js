import { jest } from "@jest/globals";

// Em ESM o mock precisa ser registrado antes do import do módulo testado, e
// por isso o import de appointments.service vem depois, com await import.
const servicesRepository = { findServicesByIds: jest.fn() };
const employeesRepository = { findEmployeeById: jest.fn() };
const appointmentsRepository = { findActiveAppointmentsForEmployeeOnDay: jest.fn() };
const settingsRepository = { findSettings: jest.fn() };

jest.unstable_mockModule("../../src/repositories/services.repository.js", () => servicesRepository);
jest.unstable_mockModule("../../src/repositories/employees.repository.js", () => employeesRepository);
jest.unstable_mockModule("../../src/repositories/appointments.repository.js", () => appointmentsRepository);
jest.unstable_mockModule("../../src/repositories/settings.repository.js", () => settingsRepository);
jest.unstable_mockModule("../../src/repositories/auth.repository.js", () => ({ findUserById: jest.fn() }));
jest.unstable_mockModule("../../src/services/notifications.service.js", () => ({ notifyUser: jest.fn() }));
jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));

const { prepareBooking } = await import("../../src/services/appointments.service.js");

const CORTE = { id: "svc-corte", name: "Corte", duration: 30, price: "40.00", active: true };
const PINTURA = { id: "svc-pintura", name: "Pintura", duration: 45, price: "70.00", active: true };

// Horário de funcionamento igual ao padrão do salão.
const HOURS = [
  { id: "sun", label: "Domingo", enabled: false, open: "", close: "" },
  { id: "mon", label: "Segunda", enabled: true, open: "09:00", close: "19:00" },
  { id: "tue", label: "Terça", enabled: true, open: "09:00", close: "19:00" },
  { id: "wed", label: "Quarta", enabled: true, open: "09:00", close: "19:00" },
  { id: "thu", label: "Quinta", enabled: true, open: "09:00", close: "19:00" },
  { id: "fri", label: "Sexta", enabled: true, open: "09:00", close: "20:00" },
  { id: "sat", label: "Sábado", enabled: true, open: "09:00", close: "17:00" },
];

// Quarta-feira distante, em hora de parede do salão (America/Sao_Paulo).
const noSalao = (dia, hhmm) => new Date(`2027-11-${dia}T${hhmm}:00-03:00`);
const QUARTA = (hhmm) => noSalao("17", hhmm);

function arrange({ services = [CORTE], employee = { id: "emp-1", active: true }, booked = [] } = {}) {
  servicesRepository.findServicesByIds.mockResolvedValue(services);
  employeesRepository.findEmployeeById.mockResolvedValue(employee);
  appointmentsRepository.findActiveAppointmentsForEmployeeOnDay.mockResolvedValue(booked);
  settingsRepository.findSettings.mockResolvedValue({ hours: HOURS });
}

describe("prepareBooking", () => {
  it("soma duração e preço de vários serviços", async () => {
    arrange({ services: [CORTE, PINTURA] });

    const result = await prepareBooking({
      serviceIds: [CORTE.id, PINTURA.id],
      employeeId: "emp-1",
      scheduledAt: QUARTA("10:00"),
    });

    expect(result.durationMinutes).toBe(75);
    expect(Number(result.price)).toBe(110);
    expect(result.services).toHaveLength(2);
  });

  it("não soma o mesmo serviço duas vezes", async () => {
    arrange({ services: [CORTE] });

    const result = await prepareBooking({
      serviceIds: [CORTE.id, CORTE.id],
      employeeId: "emp-1",
      scheduledAt: QUARTA("10:00"),
    });

    expect(result.durationMinutes).toBe(30);
    expect(Number(result.price)).toBe(40);
  });

  it("recusa data no passado", async () => {
    arrange();

    await expect(
      prepareBooking({
        serviceIds: [CORTE.id],
        employeeId: "emp-1",
        scheduledAt: new Date("2020-01-01T12:00:00-03:00"),
      })
    ).rejects.toMatchObject({ statusCode: 422, message: /future/i });
  });

  it("recusa horário antes da abertura", async () => {
    arrange();

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA("08:45") })
    ).rejects.toMatchObject({ statusCode: 422, message: /opening hours/i });
  });

  it("recusa horário depois do fechamento", async () => {
    arrange();

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA("19:00") })
    ).rejects.toMatchObject({ statusCode: 422, message: /opening hours/i });
  });

  it("recusa atendimento que terminaria depois do fechamento", async () => {
    arrange({ services: [CORTE, PINTURA] });

    await expect(
      prepareBooking({
        serviceIds: [CORTE.id, PINTURA.id],
        employeeId: "emp-1",
        scheduledAt: QUARTA("18:45"), // 75 min: terminaria 20:00, salão fecha 19:00
      })
    ).rejects.toMatchObject({ statusCode: 422, message: /end after the salon closes/i });
  });

  it("aceita atendimento que termina exatamente no fechamento", async () => {
    arrange({ services: [CORTE] });

    const result = await prepareBooking({
      serviceIds: [CORTE.id],
      employeeId: "emp-1",
      scheduledAt: QUARTA("18:30"), // 30 min: termina 19:00, na hora de fechar
    });

    expect(result.durationMinutes).toBe(30);
  });

  it("recusa por um minuto de estouro", async () => {
    arrange({ services: [CORTE] });

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA("18:45") })
    ).rejects.toMatchObject({ statusCode: 422, message: /end after the salon closes/i });
  });

  it("recusa dia em que o salão não abre", async () => {
    arrange();

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: noSalao("21", "11:00") }) // domingo
    ).rejects.toMatchObject({ statusCode: 422, message: /closed/i });
  });

  it("recusa serviço inativo", async () => {
    arrange({ services: [{ ...CORTE, active: false }] });

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA("10:00") })
    ).rejects.toMatchObject({ statusCode: 404, message: /Service not found/ });
  });

  it("recusa serviço que não existe", async () => {
    arrange({ services: [] });

    await expect(
      prepareBooking({ serviceIds: ["svc-fantasma"], employeeId: "emp-1", scheduledAt: QUARTA("10:00") })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("recusa profissional inativa", async () => {
    arrange({ employee: { id: "emp-1", active: false } });

    await expect(
      prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA("10:00") })
    ).rejects.toMatchObject({ statusCode: 404, message: /Employee not found/ });
  });

  describe("conflito de horário", () => {
    // Atendimento existente: 10:00 às 12:00 (120 min).
    const ocupado = [{ scheduledAt: QUARTA("10:00"), durationMinutes: 120 }];

    it.each([
      ["no mesmo horário", "10:00"],
      ["começando dentro do procedimento", "11:00"],
      ["terminando dentro do procedimento", "09:45"],
      ["no último minuto antes do fim", "11:45"],
    ])("recusa %s (%s)", async (_rotulo, hora) => {
      arrange({ booked: ocupado });

      await expect(
        prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA(hora) })
      ).rejects.toMatchObject({ statusCode: 409, message: /not available/i });
    });

    it.each([
      ["terminando exatamente quando o outro começa", "09:30"],
      ["começando exatamente quando o outro termina", "12:00"],
    ])("aceita %s (%s)", async (_rotulo, hora) => {
      arrange({ booked: ocupado });

      await expect(
        prepareBooking({ serviceIds: [CORTE.id], employeeId: "emp-1", scheduledAt: QUARTA(hora) })
      ).resolves.toMatchObject({ durationMinutes: 30 });
    });

    it("um agendamento longo engole horários à frente", async () => {
      arrange({ services: [CORTE, PINTURA], booked: [{ scheduledAt: QUARTA("11:00"), durationMinutes: 30 }] });

      // 75 min às 10:00 terminaria 11:15, em cima do agendamento das 11:00.
      await expect(
        prepareBooking({ serviceIds: [CORTE.id, PINTURA.id], employeeId: "emp-1", scheduledAt: QUARTA("10:00") })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });
});
