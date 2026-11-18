import { parseSseBlock } from "../src/shared/utils/parseSse.js";
import { describeAppointmentChange } from "../src/shared/utils/describeAppointmentChange.js";

describe("parseSseBlock", () => {
  it("lê evento e dados em JSON", () => {
    expect(parseSseBlock('event: appointment\ndata: {"action":"created","appointmentId":"1"}')).toEqual({
      event: "appointment",
      data: { action: "created", appointmentId: "1" },
    });
  });

  it("ignora o ping do servidor (comentário)", () => {
    expect(parseSseBlock(": ping")).toBeNull();
  });

  it("ignora dado que não é JSON em vez de quebrar a conexão", () => {
    expect(parseSseBlock("event: appointment\ndata: {quebrado")).toBeNull();
  });
});

describe("describeAppointmentChange", () => {
  it("monta o aviso com cliente, data e hora do salão", () => {
    expect(
      describeAppointmentChange({
        action: "created",
        clientName: "Maria",
        scheduledAt: "2026-11-18T17:30:00.000Z",
      })
    ).toBe("Novo agendamento: Maria · 18 nov às 14:30");
  });

  it("ação desconhecida não vira aviso", () => {
    expect(describeAppointmentChange({ action: "outra_coisa" })).toBeNull();
  });
});
