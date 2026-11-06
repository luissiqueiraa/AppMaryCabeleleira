import { mapAppointment } from "../src/shared/utils/mapAppointment.js";
import { formatServiceNames } from "../src/shared/utils/formatServices.js";

const dto = {
  id: "appt-1",
  status: "confirmed",
  scheduledAt: "2027-12-15T13:30:00.000Z",
  durationMinutes: 75,
  price: 110,
  paymentMethod: "pix",
  paymentStatus: "paid",
  services: [
    { id: "svc-1", name: "Corte de Cabelo", price: 40, durationMinutes: 30 },
    { id: "svc-2", name: "Pintura", price: 70, durationMinutes: 45 },
  ],
  employee: { id: "emp-1", fullName: "Mariana Bocchi", avatarUrl: "/uploads/avatars/x.png" },
  client: { id: "cli-1", fullName: "Regiane Almeida", avatarUrl: null },
};

describe("formatServiceNames", () => {
  it("junta os nomes numa linha", () => {
    expect(formatServiceNames(dto.services)).toBe("Corte de Cabelo + Pintura");
  });

  it("aguenta lista vazia e ausente", () => {
    expect(formatServiceNames([])).toBe("");
    expect(formatServiceNames()).toBe("");
  });
});

describe("mapAppointment", () => {
  const mapped = mapAppointment(dto);

  it("resume os serviços em texto e mantém a lista", () => {
    expect(mapped.service).toBe("Corte de Cabelo + Pintura");
    expect(mapped.services).toHaveLength(2);
  });

  it("leva as fotos de cliente e profissional", () => {
    expect(mapped.professionalAvatarUrl).toBe("/uploads/avatars/x.png");
    expect(mapped.clientAvatarUrl).toBeNull();
  });

  it("formata o horário no fuso do salão", () => {
    // 13:30 UTC = 10:30 em São Paulo.
    expect(mapped.time).toBe("10:30");
  });

  it("formata o preço em real e preserva o número", () => {
    expect(mapped.price).toMatch(/110,00/);
    expect(mapped.priceValue).toBe(110);
  });

  it("agendamento sem profissional não quebra", () => {
    const semProfissional = mapAppointment({ ...dto, employee: null });

    expect(semProfissional.professional).toBe("Sem preferência");
    expect(semProfissional.professionalAvatarUrl).toBeNull();
    expect(semProfissional.employeeId).toBeNull();
  });
});
