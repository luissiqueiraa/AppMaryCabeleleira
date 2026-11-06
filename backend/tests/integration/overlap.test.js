// Teste de integração: usa Postgres de verdade, porque a garantia que está
// sendo verificada vive no banco (constraint de exclusão
// appointments_employee_no_overlap). Nenhum teste com mock cobre isso.
//
// Roda contra o banco de TEST_DATABASE_URL (padrão: marycabelo_test no mesmo
// Postgres do projeto). Se o banco não estiver acessível, a suíte é pulada em
// vez de falhar — para `npm test` continuar servindo em máquina sem Docker.
import { PrismaClient } from "@prisma/client";

const DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@postgres:5432/marycabelo_test";

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

let bancoDisponivel = true;
let cliente;
let funcionaria;
let servico;

beforeAll(async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    bancoDisponivel = false;
    return;
  }

  await limpar();

  const roleCliente = await prisma.role.upsert({
    where: { name: "client" },
    update: {},
    create: { name: "client", description: "teste" },
  });

  cliente = await prisma.user.create({
    data: { fullName: "Cliente Teste", email: `cli-${Date.now()}@teste.local`, roleId: roleCliente.id },
  });
  const usuarioFuncionaria = await prisma.user.create({
    data: { fullName: "Profissional Teste", email: `emp-${Date.now()}@teste.local`, roleId: roleCliente.id },
  });
  funcionaria = await prisma.employee.create({
    data: { userId: usuarioFuncionaria.id, hireDate: new Date(), active: true },
  });
  servico = await prisma.service.create({
    data: { name: "Corte Teste", category: "hair", duration: 30, price: "40.00", active: true },
  });
});

afterAll(async () => {
  if (bancoDisponivel) await limpar();
  await prisma.$disconnect();
});

async function limpar() {
  await prisma.appointmentService.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: "@teste.local" } } });
  await prisma.service.deleteMany({});
}

function agendamento(hhmm, { durationMinutes = 30, status = "confirmed" } = {}) {
  return {
    clientId: cliente.id,
    employeeId: funcionaria.id,
    status,
    scheduledAt: new Date(`2027-12-15T${hhmm}:00.000Z`),
    durationMinutes,
    price: "40.00",
    paymentMethod: "on_site",
    paymentStatus: "pending",
    services: { create: [{ serviceId: servico.id, durationMinutes, price: "40.00" }] },
  };
}

const criar = (...args) => prisma.appointment.create({ data: agendamento(...args) });

// `test.skip` dinâmico: sem banco, a suíte não falha — avisa e sai.
const casoDeBanco = (nome, fn) =>
  it(nome, async () => {
    if (!bancoDisponivel) {
      console.warn(`banco de teste indisponível (${DATABASE_URL}) — pulando "${nome}"`);
      return;
    }
    await fn();
  });

describe("constraint de sobreposição no banco", () => {
  beforeEach(async () => {
    if (bancoDisponivel) {
      await prisma.appointmentService.deleteMany({});
      await prisma.appointment.deleteMany({});
    }
  });

  casoDeBanco("o banco recusa dois agendamentos no mesmo horário da mesma profissional", async () => {
    await criar("13:00", { durationMinutes: 120 });

    await expect(criar("14:00")).rejects.toThrow(/appointments_employee_no_overlap/);
  });

  casoDeBanco("aceita agendamento que começa quando o outro termina", async () => {
    await criar("13:00", { durationMinutes: 120 });

    await expect(criar("15:00")).resolves.toMatchObject({ durationMinutes: 30 });
  });

  casoDeBanco("atendimento concluído continua ocupando o horário", async () => {
    await criar("13:00", { durationMinutes: 60, status: "completed" });

    await expect(criar("13:30")).rejects.toThrow(/appointments_employee_no_overlap/);
  });

  casoDeBanco("agendamento cancelado libera o horário", async () => {
    await criar("13:00", { durationMinutes: 60, status: "cancelled" });

    await expect(criar("13:30")).resolves.toBeTruthy();
  });

  casoDeBanco("duas gravações simultâneas no mesmo horário: só uma entra", async () => {
    const resultados = await Promise.allSettled([criar("16:00"), criar("16:00"), criar("16:00")]);

    const criados = resultados.filter((r) => r.status === "fulfilled");
    const recusados = resultados.filter((r) => r.status === "rejected");

    expect(criados).toHaveLength(1);
    expect(recusados).toHaveLength(2);
    expect(String(recusados[0].reason)).toMatch(/appointments_employee_no_overlap/);
  });

  casoDeBanco("sobreposição que atravessa a meia-noite também é barrada", async () => {
    // 23:30 + 90 min entra no dia seguinte; a checagem em memória olha só o
    // dia, então aqui quem segura é o banco.
    await prisma.appointment.create({
      data: {
        ...agendamento("23:30", { durationMinutes: 90 }),
        scheduledAt: new Date("2027-12-15T23:30:00.000Z"),
      },
    });

    await expect(
      prisma.appointment.create({
        data: {
          ...agendamento("00:30"),
          scheduledAt: new Date("2027-12-16T00:30:00.000Z"),
        },
      })
    ).rejects.toThrow(/appointments_employee_no_overlap/);
  });
});
