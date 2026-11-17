import { jest } from "@jest/globals";

const clientsRepository = { findAllClients: jest.fn() };

jest.unstable_mockModule("../../src/repositories/clients.repository.js", () => clientsRepository);
jest.unstable_mockModule("../../src/repositories/auth.repository.js", () => ({
  findUserById: jest.fn(),
  softDeleteUser: jest.fn(),
  revokeAllRefreshTokensForUser: jest.fn(),
}));
jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));

const { listClients } = await import("../../src/services/clients.service.js");

function agendamento(overrides = {}) {
  return {
    id: "appt-1",
    status: "completed",
    paymentStatus: "paid",
    price: "100.00",
    scheduledAt: new Date("2026-11-01T13:00:00.000Z"),
    ...overrides,
  };
}

function cliente(agendamentos) {
  return {
    id: "cli-1",
    fullName: "Regiane",
    email: "regiane@teste.local",
    phoneNumber: null,
    avatarUrl: null,
    clientAppointments: agendamentos,
  };
}

async function dto(agendamentos) {
  clientsRepository.findAllClients.mockResolvedValue([cliente(agendamentos)]);
  const [resultado] = await listClients();
  return resultado;
}

describe("gasto total da cliente", () => {
  it("soma o que foi pago e atendido", async () => {
    const resultado = await dto([agendamento()]);

    expect(resultado.spent).toBe(100);
  });

  // O caso que estava quebrado: pagou pix de um horário futuro e a tela
  // mostrava R$ 0, porque só contava atendimento concluído.
  it("conta pagamento confirmado de horário que ainda não aconteceu", async () => {
    const resultado = await dto([
      agendamento({ status: "confirmed", paymentStatus: "paid", price: "80.00" }),
    ]);

    expect(resultado.spent).toBe(80);
  });

  it("conta dinheiro recebido no salão depois da baixa manual", async () => {
    const resultado = await dto([
      agendamento({ status: "confirmed", paymentMethod: "on_site", paymentStatus: "paid", price: "45.50" }),
    ]);

    expect(resultado.spent).toBe(45.5);
  });

  it("atendida sem pagar não conta como gasto", async () => {
    const resultado = await dto([agendamento({ status: "completed", paymentStatus: "pending" })]);

    expect(resultado.spent).toBe(0);
  });

  it("cancelado não conta, mesmo se tiver sido pago", async () => {
    // Valor de agendamento cancelado é devolução, não gasto.
    const resultado = await dto([agendamento({ status: "cancelled", paymentStatus: "paid" })]);

    expect(resultado.spent).toBe(0);
  });

  it("soma vários agendamentos pagos", async () => {
    const resultado = await dto([
      agendamento({ id: "a1", price: "100.00" }),
      agendamento({ id: "a2", status: "confirmed", price: "0.01" }),
      agendamento({ id: "a3", status: "completed", paymentStatus: "pending", price: "999.00" }),
      agendamento({ id: "a4", status: "cancelled", price: "50.00" }),
    ]);

    expect(resultado.spent).toBe(100.01);
  });

  it("cliente sem agendamento soma zero, não null", async () => {
    const resultado = await dto([]);

    expect(resultado.spent).toBe(0);
    expect(resultado.visits).toBe(0);
    expect(resultado.lastVisit).toBeNull();
  });
});

describe("visitas da cliente", () => {
  it("conta apenas atendimento concluído", async () => {
    const resultado = await dto([
      agendamento({ id: "a1", status: "completed" }),
      agendamento({ id: "a2", status: "confirmed" }),
      agendamento({ id: "a3", status: "cancelled" }),
    ]);

    expect(resultado.visits).toBe(1);
  });

  // Visita é atendimento que aconteceu: pagar adiantado não é visita, ainda
  // que entre no gasto.
  it("pagamento de horário futuro não conta como visita", async () => {
    const resultado = await dto([agendamento({ status: "confirmed", paymentStatus: "paid" })]);

    expect(resultado.visits).toBe(0);
    expect(resultado.spent).toBe(100);
  });

  it("última visita é o atendimento concluído mais recente", async () => {
    const resultado = await dto([
      agendamento({ id: "a1", scheduledAt: new Date("2026-10-01T13:00:00.000Z") }),
      agendamento({ id: "a2", scheduledAt: new Date("2026-11-05T13:00:00.000Z") }),
      // Futuro e confirmado não é visita, então não pode virar "última visita".
      agendamento({ id: "a3", status: "confirmed", scheduledAt: new Date("2027-01-01T13:00:00.000Z") }),
    ]);

    expect(resultado.lastVisit).toEqual(new Date("2026-11-05T13:00:00.000Z"));
  });
});

describe("segmentação da cliente", () => {
  const futuro = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const anoPassado = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);

  // O caso que estava errado: quem acabou de agendar caía em "Inativas",
  // que é justamente a lista de quem se quer reconquistar.
  it("quem tem horário marcado não é inativa", async () => {
    const resultado = await dto([agendamento({ status: "confirmed", scheduledAt: futuro })]);

    expect(resultado.segment).toBe("upcoming");
  });

  it("horário marcado vale mais que a última visita antiga", async () => {
    const resultado = await dto([
      agendamento({ id: "a1", status: "completed", scheduledAt: anoPassado }),
      agendamento({ id: "a2", status: "confirmed", scheduledAt: futuro }),
    ]);

    expect(resultado.segment).toBe("upcoming");
  });

  it("agendamento cancelado no futuro não torna a cliente ativa", async () => {
    const resultado = await dto([agendamento({ status: "cancelled", scheduledAt: futuro })]);

    expect(resultado.segment).toBe("inactive");
  });

  it("horário que já passou e não foi atendido não conta como marcado", async () => {
    const resultado = await dto([agendamento({ status: "confirmed", scheduledAt: anoPassado })]);

    expect(resultado.segment).toBe("inactive");
  });

  it("visita recente sem horário marcado é recente", async () => {
    const resultado = await dto([agendamento({ status: "completed", scheduledAt: ontem })]);

    expect(resultado.segment).toBe("recent");
  });

  it("última visita velha e nada marcado é inativa", async () => {
    const resultado = await dto([agendamento({ status: "completed", scheduledAt: anoPassado })]);

    expect(resultado.segment).toBe("inactive");
  });

  it("cliente sem nenhum agendamento é inativa", async () => {
    const resultado = await dto([]);

    expect(resultado.segment).toBe("inactive");
  });
});
