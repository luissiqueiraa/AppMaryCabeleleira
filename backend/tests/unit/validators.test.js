import { createAppointmentSchema } from "../../src/validators/appointments.validator.js";
import { createPaymentSchema } from "../../src/validators/payments.validator.js";
import { registerPasswordSchema } from "../../src/validators/password.schema.js";
import { resetSystemSchema } from "../../src/validators/settings.validator.js";

const UUID = "3f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f";
const OUTRO_UUID = "4f1c2d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f";

const agendamentoValido = {
  serviceIds: [UUID],
  employeeId: OUTRO_UUID,
  scheduledAt: "2027-11-17T13:00:00.000Z",
};

describe("criar agendamento", () => {
  it("aceita vários serviços", () => {
    const result = createAppointmentSchema.body.safeParse({
      ...agendamentoValido,
      serviceIds: [UUID, OUTRO_UUID],
    });

    expect(result.success).toBe(true);
    expect(result.data.serviceIds).toHaveLength(2);
  });

  it("exige pelo menos um serviço", () => {
    const result = createAppointmentSchema.body.safeParse({ ...agendamentoValido, serviceIds: [] });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/ao menos um serviço/i);
  });

  it("limita a dez serviços", () => {
    const result = createAppointmentSchema.body.safeParse({
      ...agendamentoValido,
      serviceIds: Array.from({ length: 11 }, () => UUID),
    });

    expect(result.success).toBe(false);
  });

  it("exige profissional", () => {
    const { employeeId, ...semProfissional } = agendamentoValido;
    const result = createAppointmentSchema.body.safeParse(semProfissional);

    expect(result.success).toBe(false);
  });

  it("converte a data recebida em Date", () => {
    const result = createAppointmentSchema.body.safeParse(agendamentoValido);

    expect(result.data.scheduledAt).toBeInstanceOf(Date);
  });
});

describe("abrir cobrança", () => {
  it.each(["pix", "card"])("aceita %s", (method) => {
    const result = createPaymentSchema.body.safeParse({ ...agendamentoValido, method });

    expect(result.success).toBe(true);
  });

  it("recusa on_site (não gera cobrança online)", () => {
    const result = createPaymentSchema.body.safeParse({ ...agendamentoValido, method: "on_site" });

    expect(result.success).toBe(false);
  });

  it("recusa método inventado", () => {
    const result = createPaymentSchema.body.safeParse({ ...agendamentoValido, method: "boleto" });

    expect(result.success).toBe(false);
  });
});

describe("senha de cadastro", () => {
  it.each([
    ["seis caracteres", "123456", true],
    ["cinco caracteres", "12345", false],
    ["sem complexidade exigida", "aaaaaa", true],
  ])("%s", (_rotulo, senha, esperado) => {
    expect(registerPasswordSchema.safeParse(senha).success).toBe(esperado);
  });

  it("recusa senha acima de 72 caracteres (limite do bcrypt)", () => {
    expect(registerPasswordSchema.safeParse("a".repeat(73)).success).toBe(false);
  });
});

describe("reset do sistema", () => {
  it("exige a frase de confirmação", () => {
    expect(resetSystemSchema.body.safeParse({ password: "x" }).success).toBe(false);
    expect(resetSystemSchema.body.safeParse({ confirmation: "", password: "x" }).success).toBe(false);
  });

  it("aceita frase e senha", () => {
    expect(resetSystemSchema.body.safeParse({ confirmation: "APAGAR TUDO", password: "x" }).success).toBe(true);
  });
});
