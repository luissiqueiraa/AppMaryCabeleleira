import { jest } from "@jest/globals";

const appointmentsRepository = {
  findAppointmentById: jest.fn(),
  updateAppointment: jest.fn(),
  softDeleteAppointment: jest.fn(),
  sumReceivedRevenue: jest.fn(),
  sumPrepaidRevenue: jest.fn(),
  sumPendingRevenue: jest.fn(),
  sumRefundDue: jest.fn(),
  markAppointmentRefunded: jest.fn(),
};
const notificationsService = { notifyUser: jest.fn() };

jest.unstable_mockModule("../../src/repositories/appointments.repository.js", () => appointmentsRepository);
jest.unstable_mockModule("../../src/repositories/services.repository.js", () => ({ findServicesByIds: jest.fn() }));
jest.unstable_mockModule("../../src/repositories/employees.repository.js", () => ({ findEmployeeById: jest.fn() }));
jest.unstable_mockModule("../../src/repositories/settings.repository.js", () => ({ findSettings: jest.fn() }));
jest.unstable_mockModule("../../src/repositories/auth.repository.js", () => ({ findUserById: jest.fn() }));
jest.unstable_mockModule("../../src/services/notifications.service.js", () => notificationsService);
jest.unstable_mockModule("../../src/utils/auditLogger.js", () => ({ recordAuditLog: jest.fn() }));
const appointmentEvents = { publishAppointmentChange: jest.fn() };
jest.unstable_mockModule("../../src/utils/appointmentEvents.js", () => appointmentEvents);

const { updateAppointmentPayment, getRevenueSummary, deleteAppointment, markAppointmentRefunded } = await import(
  "../../src/services/appointments.service.js"
);

const req = { user: { id: "admin-1" } };

function agendamento(overrides = {}) {
  return {
    id: "appt-1",
    clientId: "cli-1",
    status: "completed",
    scheduledAt: new Date("2027-11-17T13:00:00.000Z"),
    durationMinutes: 30,
    price: "40.00",
    paymentMethod: "on_site",
    paymentStatus: "pending",
    notes: null,
    services: [{ service: { id: "svc-1", name: "Corte" }, durationMinutes: 30, price: "40.00" }],
    employee: null,
    client: { id: "cli-1", fullName: "Regiane", phoneNumber: null, avatarUrl: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("confirmar dinheiro recebido no salão", () => {
  it("marca como pago e avisa a cliente", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento());
    appointmentsRepository.updateAppointment.mockResolvedValue(agendamento({ paymentStatus: "paid" }));

    const dto = await updateAppointmentPayment("appt-1", { paymentStatus: "paid" }, req);

    expect(appointmentsRepository.updateAppointment).toHaveBeenCalledWith("appt-1", { paymentStatus: "paid" });
    expect(dto.paymentStatus).toBe("paid");
    expect(notificationsService.notifyUser).toHaveBeenCalledWith(
      "cli-1",
      expect.objectContaining({ title: "Pagamento registrado" })
    );
  });

  it("desfazer a baixa não notifica a cliente", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento({ paymentStatus: "paid" }));
    appointmentsRepository.updateAppointment.mockResolvedValue(agendamento({ paymentStatus: "pending" }));

    const dto = await updateAppointmentPayment("appt-1", { paymentStatus: "pending" }, req);

    expect(dto.paymentStatus).toBe("pending");
    expect(notificationsService.notifyUser).not.toHaveBeenCalled();
  });

  it.each(["pix", "card"])("recusa baixa manual em pagamento por %s", async (paymentMethod) => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento({ paymentMethod }));

    await expect(
      updateAppointmentPayment("appt-1", { paymentStatus: "paid" }, req)
    ).rejects.toMatchObject({ statusCode: 422, message: /payment provider/i });

    expect(appointmentsRepository.updateAppointment).not.toHaveBeenCalled();
  });

  it("recusa agendamento cancelado", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento({ status: "cancelled" }));

    await expect(
      updateAppointmentPayment("appt-1", { paymentStatus: "paid" }, req)
    ).rejects.toMatchObject({ statusCode: 422, message: /cancelled/i });
  });

  it("agendamento inexistente dá 404", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(null);

    await expect(
      updateAppointmentPayment("nao-existe", { paymentStatus: "paid" }, req)
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("aceita dar baixa antes do atendimento (cliente pagou adiantado)", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento({ status: "confirmed" }));
    appointmentsRepository.updateAppointment.mockResolvedValue(
      agendamento({ status: "confirmed", paymentStatus: "paid" })
    );

    await expect(
      updateAppointmentPayment("appt-1", { paymentStatus: "paid" }, req)
    ).resolves.toMatchObject({ paymentStatus: "paid" });
  });
});

describe("caixa", () => {
  it("separa recebido, pago adiantado e a receber", async () => {
    appointmentsRepository.sumReceivedRevenue.mockResolvedValue(660);
    appointmentsRepository.sumPrepaidRevenue.mockResolvedValue(120);
    appointmentsRepository.sumPendingRevenue.mockResolvedValue(940);
    appointmentsRepository.sumRefundDue.mockResolvedValue(90);

    await expect(getRevenueSummary()).resolves.toEqual({ total: 660, prepaid: 120, pending: 940, refundDue: 90 });
  });
});

describe("excluir atendimento", () => {
  it("permite excluir mesmo concluído e pago por pix", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(
      agendamento({ status: "completed", paymentMethod: "pix", paymentStatus: "paid" })
    );

    await expect(deleteAppointment("appt-1", req)).resolves.toBeUndefined();
    expect(appointmentsRepository.softDeleteAppointment).toHaveBeenCalledWith("appt-1");
  });

  it("avisa o painel em tempo real, com quem fez a mudança", async () => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento());

    await deleteAppointment("appt-1", req);

    expect(appointmentEvents.publishAppointmentChange).toHaveBeenCalledWith(
      expect.objectContaining({ action: "deleted", appointmentId: "appt-1", actorId: "admin-1" })
    );
  });
});

describe("estorno de atendimento cancelado e pago", () => {
  it("registra o estorno, avisa a cliente e o painel", async () => {
    const cancelado = agendamento({ status: "cancelled", paymentMethod: "pix", paymentStatus: "paid" });
    appointmentsRepository.findAppointmentById.mockResolvedValue(cancelado);
    appointmentsRepository.markAppointmentRefunded.mockResolvedValue({ ...cancelado, paymentStatus: "refunded" });

    const result = await markAppointmentRefunded("appt-1", req);

    expect(result.paymentStatus).toBe("refunded");
    expect(appointmentsRepository.markAppointmentRefunded).toHaveBeenCalledWith("appt-1");
    expect(notificationsService.notifyUser).toHaveBeenCalledWith(
      "cli-1",
      expect.objectContaining({ title: "Estorno registrado" })
    );
    expect(appointmentEvents.publishAppointmentChange).toHaveBeenCalledWith(
      expect.objectContaining({ action: "refunded", actorId: "admin-1" })
    );
  });

  it.each([
    ["não foi cancelado", { status: "completed", paymentStatus: "paid" }],
    ["não foi pago", { status: "cancelled", paymentStatus: "pending" }],
    ["já foi estornado", { status: "cancelled", paymentStatus: "refunded" }],
  ])("recusa quando o atendimento %s", async (_caso, overrides) => {
    appointmentsRepository.findAppointmentById.mockResolvedValue(agendamento(overrides));

    await expect(markAppointmentRefunded("appt-1", req)).rejects.toMatchObject({ statusCode: 422 });
    expect(appointmentsRepository.markAppointmentRefunded).not.toHaveBeenCalled();
  });
});
