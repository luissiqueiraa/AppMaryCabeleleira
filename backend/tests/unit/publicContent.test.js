import { jest } from "@jest/globals";

const settingsRepository = { findSettings: jest.fn() };
const servicesRepository = { findAllServices: jest.fn() };
const employeesRepository = { findAllEmployees: jest.fn() };

jest.unstable_mockModule("../../src/repositories/settings.repository.js", () => settingsRepository);
jest.unstable_mockModule("../../src/repositories/services.repository.js", () => servicesRepository);
jest.unstable_mockModule("../../src/repositories/employees.repository.js", () => employeesRepository);

const { getHomeContent } = await import("../../src/services/public.service.js");

// Linhas como vêm do banco, com os campos que NÃO podem sair daqui: a rota é
// aberta a quem não tem conta.
const SERVICO = {
  id: "svc-1",
  name: "Corte de Cabelo",
  description: "Corte personalizado",
  category: "hair",
  duration: 30,
  price: "70.00",
  active: true,
  deletedAt: null,
};

const FUNCIONARIA = {
  id: "emp-1",
  userId: "user-1",
  hireDate: new Date("2026-01-01"),
  active: true,
  user: {
    id: "user-1",
    fullName: "Mariana Bocchi",
    avatarUrl: "/uploads/avatars/mariana.png",
    email: "mariana@marycabeleleira.com",
    phoneNumber: "11999999999",
    passwordHash: "$2a$12$hash",
  },
};

const SETTINGS = {
  id: "settings-1",
  name: "MaryCabeleleira",
  address: "R. Oscar Freire, 472",
  phone: "(11) 3456-2210",
  email: "ola@marycabeleleira.com.br",
  logoUrl: "/uploads/logos/logo.png",
  hours: [{ id: "mon", label: "Segunda", enabled: true, open: "09:00", close: "19:00" }],
  updatedAt: new Date(),
};

beforeEach(() => {
  settingsRepository.findSettings.mockResolvedValue(SETTINGS);
  servicesRepository.findAllServices.mockResolvedValue([SERVICO]);
  employeesRepository.findAllEmployees.mockResolvedValue([FUNCIONARIA]);
});

describe("conteúdo público da home", () => {
  it("pede só serviços e profissionais ativas", async () => {
    await getHomeContent();

    expect(servicesRepository.findAllServices).toHaveBeenCalledWith({ activeOnly: true });
    expect(employeesRepository.findAllEmployees).toHaveBeenCalledWith({ activeOnly: true });
  });

  it("devolve o salão, os serviços e a equipe", async () => {
    const content = await getHomeContent();

    expect(content.salon).toEqual({
      name: "MaryCabeleleira",
      address: "R. Oscar Freire, 472",
      phone: "(11) 3456-2210",
      email: "ola@marycabeleleira.com.br",
      logoUrl: "/uploads/logos/logo.png",
      hours: SETTINGS.hours,
    });
    expect(content.services).toEqual([
      {
        id: "svc-1",
        name: "Corte de Cabelo",
        description: "Corte personalizado",
        category: "hair",
        duration: 30,
        price: 70,
      },
    ]);
  });

  it("a profissional leva só nome, foto e id (o id serve para agendar com ela)", async () => {
    const content = await getHomeContent();

    expect(content.professionals).toEqual([
      { id: "emp-1", fullName: "Mariana Bocchi", avatarUrl: "/uploads/avatars/mariana.png" },
    ]);
  });

  // O risco desta rota é vazamento: ela não exige login.
  it("não vaza e-mail, telefone, senha nem userId da equipe", async () => {
    const content = await getHomeContent();
    const serializado = JSON.stringify(content);

    expect(serializado).not.toContain("mariana@marycabeleleira.com");
    expect(serializado).not.toContain("11999999999");
    expect(serializado).not.toContain("$2a$12$hash");
    expect(serializado).not.toContain("user-1");
  });

  it("preço vira número, não Decimal em texto", async () => {
    const content = await getHomeContent();

    expect(typeof content.services[0].price).toBe("number");
  });

  it("salão sem configuração não derruba a home", async () => {
    settingsRepository.findSettings.mockResolvedValue(null);

    await expect(getHomeContent()).resolves.toMatchObject({ salon: null });
  });

  it("catálogo e equipe vazios devolvem listas vazias", async () => {
    servicesRepository.findAllServices.mockResolvedValue([]);
    employeesRepository.findAllEmployees.mockResolvedValue([]);

    const content = await getHomeContent();

    expect(content.services).toEqual([]);
    expect(content.professionals).toEqual([]);
  });
});
