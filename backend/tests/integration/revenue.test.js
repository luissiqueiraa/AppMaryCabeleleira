// Integração: o caixa é uma agregação SQL, então o que importa é o que o
// Postgres soma. Aqui a regra verificada é "Recebido = concluído E pago".
import { PrismaClient } from "@prisma/client";
import * as repository from "../../src/repositories/appointments.repository.js";

const DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@postgres:5432/marycabelo_test";

// O repositório usa o cliente de src/config/database.js, que lê DATABASE_URL
// do ambiente — apontando para o banco de teste antes de qualquer consulta.
process.env.DATABASE_URL = DATABASE_URL;

const prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

let bancoDisponivel = true;
let cliente;
let funcionaria;
let servico;

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    bancoDisponivel = false;
    return;
  }

  await limpar();

  const role = await prisma.role.upsert({
    where: { name: "client" },
    update: {},
    create: { name: "client", description: "teste" },
  });
  cliente = await prisma.user.create({
    data: { fullName: "Cliente Caixa", email: `caixa-${Date.now()}@teste.local`, roleId: role.id },
  });
  const usuaria = await prisma.user.create({
    data: { fullName: "Profissional Caixa", email: `caixa-emp-${Date.now()}@teste.local`, roleId: role.id },
  });
  funcionaria = await prisma.employee.create({
    data: { userId: usuaria.id, hireDate: new Date(), active: true },
  });
  servico = await prisma.service.create({
    data: { name: "Serviço Caixa", category: "hair", duration: 30, price: "100.00", active: true },
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

// Cada agendamento em hora diferente: a constraint de sobreposição não deixa
// empilhar no mesmo horário.
let hora = 10;
function criar({ status, paymentStatus, paymentMethod = "on_site", price = "100.00" }) {
  const scheduledAt = new Date(`2028-01-12T${String(hora++).padStart(2, "0")}:00:00.000Z`);
  return prisma.appointment.create({
    data: {
      clientId: cliente.id,
      employeeId: funcionaria.id,
      status,
      paymentStatus,
      paymentMethod,
      scheduledAt,
      durationMinutes: 30,
      price,
      services: { create: [{ serviceId: servico.id, durationMinutes: 30, price }] },
    },
  });
}

const casoDeBanco = (nome, fn) =>
  it(nome, async () => {
    if (!bancoDisponivel) {
      console.warn(`banco de teste indisponível (${DATABASE_URL}) — pulando "${nome}"`);
      return;
    }
    await fn();
  });

describe("caixa do salão", () => {
  casoDeBanco("soma só o que foi concluído e pago", async () => {
    await criar({ status: "completed", paymentStatus: "paid" }); // entra: 100
    await criar({ status: "completed", paymentStatus: "paid", paymentMethod: "pix" }); // entra: 100
    await criar({ status: "completed", paymentStatus: "pending" }); // atendido, não pagou
    await criar({ status: "confirmed", paymentStatus: "paid" }); // pagou adiantado, não atendeu
    await criar({ status: "confirmed", paymentStatus: "pending" }); // só agendado
    await criar({ status: "cancelled", paymentStatus: "pending" }); // cancelado

    expect(await repository.sumReceivedRevenue()).toBe(200);
  });

  casoDeBanco("a receber ignora cancelado e inclui o que já foi atendido sem pagar", async () => {
    await criar({ status: "completed", paymentStatus: "pending" }); // 100
    await criar({ status: "confirmed", paymentStatus: "pending" }); // 100
    await criar({ status: "cancelled", paymentStatus: "pending" }); // fora
    await criar({ status: "completed", paymentStatus: "paid" }); // já entrou no caixa

    expect(await repository.sumPendingRevenue()).toBe(200);
  });

  casoDeBanco("confirmar o pagamento move o valor de 'a receber' para 'recebido'", async () => {
    const appt = await criar({ status: "completed", paymentStatus: "pending", price: "150.00" });

    expect(await repository.sumReceivedRevenue()).toBe(0);
    expect(await repository.sumPendingRevenue()).toBe(150);

    await prisma.appointment.update({ where: { id: appt.id }, data: { paymentStatus: "paid" } });

    expect(await repository.sumReceivedRevenue()).toBe(150);
    expect(await repository.sumPendingRevenue()).toBe(0);
  });

  casoDeBanco("base sem agendamento soma zero, não null", async () => {
    expect(await repository.sumReceivedRevenue()).toBe(0);
    expect(await repository.sumPendingRevenue()).toBe(0);
  });

  beforeEach(async () => {
    if (bancoDisponivel) {
      await prisma.appointmentService.deleteMany({});
      await prisma.appointment.deleteMany({});
    }
  });
});
