import { jest } from "@jest/globals";

const paymentsRepository = {
  findPaymentById: jest.fn(),
  findPaymentByProviderId: jest.fn(),
  updatePayment: jest.fn(),
  createPayment: jest.fn(),
  findPendingPaymentFor: jest.fn(),
};
const appointmentsService = { createAppointmentForPayment: jest.fn(), prepareBooking: jest.fn() };
const notificationsService = { notifyUser: jest.fn() };
const mercadoPago = {
  isOnlinePaymentEnabled: jest.fn(() => true),
  getPayment: jest.fn(),
  createPixPayment: jest.fn(),
  createCardCheckout: jest.fn(),
  isWebhookSignatureValid: jest.fn(() => null),
};

jest.unstable_mockModule("../../src/repositories/payments.repository.js", () => paymentsRepository);
jest.unstable_mockModule("../../src/repositories/auth.repository.js", () => ({ findUserById: jest.fn() }));
jest.unstable_mockModule("../../src/services/appointments.service.js", () => appointmentsService);
jest.unstable_mockModule("../../src/services/notifications.service.js", () => notificationsService);
jest.unstable_mockModule("../../src/config/mercadopago.js", () => mercadoPago);
jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));

const paymentsService = await import("../../src/services/payments.service.js");

function cobrancaPendente(overrides = {}) {
  return {
    id: "pay-1",
    clientId: "cli-1",
    method: "pix",
    status: "pending",
    amount: "110.00",
    employeeId: "emp-1",
    scheduledAt: new Date("2027-11-17T13:00:00.000Z"),
    durationMinutes: 75,
    services: [
      { id: "svc-1", name: "Corte", price: 40, durationMinutes: 30 },
      { id: "svc-2", name: "Pintura", price: 70, durationMinutes: 45 },
    ],
    notes: null,
    providerPaymentId: "mp-999",
    appointmentId: null,
    expiresAt: new Date(Date.now() + 10 * 60000),
    ...overrides,
  };
}

const aprovado = (overrides = {}) => ({
  providerPaymentId: "mp-999",
  status: "approved",
  amount: 110,
  externalReference: "pay-1",
  method: "pix",
  ...overrides,
});

beforeEach(() => {
  paymentsRepository.updatePayment.mockImplementation((id, data) => ({ ...cobrancaPendente(), id, ...data }));
});

describe("confirmação de pagamento (via webhook)", () => {
  it("pagamento aprovado cria o agendamento e marca como pago", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(cobrancaPendente());
    mercadoPago.getPayment.mockResolvedValue(aprovado());
    appointmentsService.createAppointmentForPayment.mockResolvedValue({ id: "appt-1" });

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(appointmentsService.createAppointmentForPayment).toHaveBeenCalledTimes(1);
    expect(paymentsRepository.updatePayment).toHaveBeenCalledWith(
      "pay-1",
      expect.objectContaining({ status: "paid", appointmentId: "appt-1" })
    );
    expect(notificationsService.notifyUser).toHaveBeenCalledWith(
      "cli-1",
      expect.objectContaining({ title: "Pagamento confirmado" })
    );
  });

  it("não confia no corpo da notificação: pergunta o status ao provedor", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(cobrancaPendente());
    // A notificação diz "pagamento", mas o provedor diz que foi recusado.
    mercadoPago.getPayment.mockResolvedValue(aprovado({ status: "rejected" }));

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(appointmentsService.createAppointmentForPayment).not.toHaveBeenCalled();
    expect(paymentsRepository.updatePayment).toHaveBeenCalledWith(
      "pay-1",
      expect.objectContaining({ status: "failed", failureReason: "rejected" })
    );
  });

  it("recusa assinatura inválida sem consultar nada", async () => {
    mercadoPago.isWebhookSignatureValid.mockReturnValueOnce(false);

    await expect(
      paymentsService.handleProviderNotification({
        body: { type: "payment", data: { id: "mp-999" } },
        headers: { "x-signature": "ts=1,v1=falso" },
      })
    ).rejects.toMatchObject({ statusCode: 401 });

    expect(mercadoPago.getPayment).not.toHaveBeenCalled();
  });

  it("valor divergente não vira agendamento", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(cobrancaPendente());
    // Cobrança de R$ 110, pagamento de R$ 1: adulteração.
    mercadoPago.getPayment.mockResolvedValue(aprovado({ amount: 1 }));

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(appointmentsService.createAppointmentForPayment).not.toHaveBeenCalled();
    expect(paymentsRepository.updatePayment).toHaveBeenCalledWith(
      "pay-1",
      expect.objectContaining({ status: "failed", failureReason: "amount_mismatch" })
    );
  });

  it("diferença de centavos por arredondamento é aceita", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(cobrancaPendente());
    mercadoPago.getPayment.mockResolvedValue(aprovado({ amount: 110.004 }));
    appointmentsService.createAppointmentForPayment.mockResolvedValue({ id: "appt-1" });

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(appointmentsService.createAppointmentForPayment).toHaveBeenCalled();
  });

  it("webhook repetido não cria um segundo agendamento", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(
      cobrancaPendente({ status: "paid", appointmentId: "appt-1" })
    );
    mercadoPago.getPayment.mockResolvedValue(aprovado());

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(appointmentsService.createAppointmentForPayment).not.toHaveBeenCalled();
  });

  it("horário tomado durante o pagamento marca a cobrança para devolução", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(cobrancaPendente());
    mercadoPago.getPayment.mockResolvedValue(aprovado());
    appointmentsService.createAppointmentForPayment.mockRejectedValue(
      Object.assign(new Error("not available"), { statusCode: 409 })
    );

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-999" } },
      headers: {},
    });

    expect(paymentsRepository.updatePayment).toHaveBeenCalledWith(
      "pay-1",
      expect.objectContaining({ status: "failed", failureReason: "slot_taken" })
    );
    // A cliente precisa saber que pagou e não tem horário.
    expect(notificationsService.notifyUser).toHaveBeenCalledWith(
      "cli-1",
      expect.objectContaining({ title: expect.stringContaining("Não foi possível") })
    );
  });

  it("notificação de pagamento desconhecido é ignorada sem erro", async () => {
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(null);
    paymentsRepository.findPaymentById.mockResolvedValue(null);
    mercadoPago.getPayment.mockResolvedValue(aprovado({ externalReference: null }));

    const result = await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-desconhecido" } },
      headers: {},
    });

    expect(result).toEqual({ ignored: true });
  });

  it("notificação que não é de pagamento é ignorada", async () => {
    const result = await paymentsService.handleProviderNotification({
      body: { type: "plan", data: { id: "qualquer" } },
      headers: {},
    });

    expect(result).toEqual({ ignored: true });
    expect(mercadoPago.getPayment).not.toHaveBeenCalled();
  });

  it("cartão se liga à cobrança pela referência externa", async () => {
    // No cartão o id do provedor só nasce no webhook, então a busca por
    // providerPaymentId falha e o external_reference é o que salva.
    paymentsRepository.findPaymentByProviderId.mockResolvedValue(null);
    paymentsRepository.findPaymentById.mockResolvedValue(
      cobrancaPendente({ method: "card", providerPaymentId: null })
    );
    mercadoPago.getPayment.mockResolvedValue(aprovado({ providerPaymentId: "mp-card-1", method: "visa" }));
    appointmentsService.createAppointmentForPayment.mockResolvedValue({ id: "appt-card" });

    await paymentsService.handleProviderNotification({
      body: { type: "payment", data: { id: "mp-card-1" } },
      headers: {},
    });

    expect(paymentsRepository.findPaymentById).toHaveBeenCalledWith("pay-1");
    expect(paymentsRepository.updatePayment).toHaveBeenCalledWith(
      "pay-1",
      expect.objectContaining({ status: "paid", appointmentId: "appt-card" })
    );
  });
});

describe("consulta da cobrança", () => {
  it("reconcilia com o provedor enquanto está pendente (cobre webhook perdido)", async () => {
    paymentsRepository.findPaymentById.mockResolvedValue(cobrancaPendente());
    mercadoPago.getPayment.mockResolvedValue(aprovado());
    appointmentsService.createAppointmentForPayment.mockResolvedValue({ id: "appt-2" });

    const dto = await paymentsService.getPayment("pay-1");

    expect(mercadoPago.getPayment).toHaveBeenCalledWith("mp-999");
    expect(dto.status).toBe("paid");
    expect(dto.appointmentId).toBe("appt-2");
  });

  it("cobrança vencida vira expired", async () => {
    paymentsRepository.findPaymentById.mockResolvedValue(
      cobrancaPendente({ expiresAt: new Date(Date.now() - 60000), providerPaymentId: null })
    );

    const dto = await paymentsService.getPayment("pay-1");

    expect(dto.status).toBe("expired");
  });

  it("cobrança paga não é consultada de novo no provedor", async () => {
    paymentsRepository.findPaymentById.mockResolvedValue(
      cobrancaPendente({ status: "paid", appointmentId: "appt-1" })
    );

    const dto = await paymentsService.getPayment("pay-1");

    expect(mercadoPago.getPayment).not.toHaveBeenCalled();
    expect(dto.status).toBe("paid");
  });

  it("cobrança inexistente dá 404", async () => {
    paymentsRepository.findPaymentById.mockResolvedValue(null);

    await expect(paymentsService.getPayment("nao-existe")).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe("abertura da cobrança", () => {
  it("pagar no salão não passa por cobrança online", async () => {
    await expect(
      paymentsService.createPayment({ method: "on_site", serviceIds: [], employeeId: "emp-1" }, { user: { id: "cli-1" } })
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  it("recusa quando o provedor não está configurado", async () => {
    mercadoPago.isOnlinePaymentEnabled.mockReturnValueOnce(false);

    await expect(
      paymentsService.createPayment({ method: "pix", serviceIds: ["svc-1"], employeeId: "emp-1" }, { user: { id: "cli-1" } })
    ).rejects.toMatchObject({ statusCode: 503 });
  });
});
