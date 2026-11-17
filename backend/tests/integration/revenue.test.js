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
    data: {
      name: "Serviço Caixa",
      // A categoria é relação agora: o serviço precisa de uma existindo.
      category: { create: { name: "Categoria Teste Caixa", slug: "teste-caixa" } },
      duration: 30,
      price: "100.00",
      active: true,
    },
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
  // Depois dos serviços: a FK é Restrict, categoria com serviço dentro não sai.
  // E o nome é único, então deixá-la faria a próxima execução falhar.
  await prisma.serviceCategory.deleteMany({ where: { slug: { startsWith: "teste-" } } });
}

// Cada agendamento em hora diferente: a constraint de sobreposição não deixa
// empilhar no mesmo horário. Conta a partir de uma base e vira o dia sozinho —
// o contador de hora anterior estourava em 23h e gerava Invalid Date quando a
// suíte crescia.
const BASE = new Date("2028-01-12T10:00:00.000Z");
let criados = 0;
function criar({ status, paymentStatus, paymentMethod = "on_site", price = "100.00" }) {
  const scheduledAt = new Date(BASE.getTime() + criados++ * 60 * 60 * 1000);
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

  casoDeBanco("pago adiantado é o que já entrou de atendimento que não aconteceu", async () => {
    await criar({ status: "confirmed", paymentStatus: "paid", paymentMethod: "pix" }); // 100
    await criar({ status: "pending", paymentStatus: "paid", paymentMethod: "card" }); // 100
    await criar({ status: "completed", paymentStatus: "paid" }); // já é "recebido"
    await criar({ status: "confirmed", paymentStatus: "pending" }); // nada entrou
    await criar({ status: "cancelled", paymentStatus: "paid" }); // devolução, não caixa

    expect(await repository.sumPrepaidRevenue()).toBe(200);
  });

  // A regra que faltava: as três divisões não se sobrepõem e, juntas, cobrem
  // todo valor não cancelado. Antes o pago adiantado não estava em nenhuma, e
  // o dinheiro desaparecia do painel.
  casoDeBanco("as três divisões não se sobrepõem e não deixam valor de fora", async () => {
    await criar({ status: "completed", paymentStatus: "paid" }); // recebido
    await criar({ status: "confirmed", paymentStatus: "paid" }); // pago adiantado
    await criar({ status: "completed", paymentStatus: "pending" }); // a receber
    await criar({ status: "confirmed", paymentStatus: "pending" }); // a receber
    await criar({ status: "cancelled", paymentStatus: "paid" }); // fora de tudo

    const recebido = await repository.sumReceivedRevenue();
    const adiantado = await repository.sumPrepaidRevenue();
    const aReceber = await repository.sumPendingRevenue();

    expect(recebido).toBe(100);
    expect(adiantado).toBe(100);
    expect(aReceber).toBe(200);
    // 500 criados, 100 cancelados: o resto tem de estar classificado.
    expect(recebido + adiantado + aReceber).toBe(400);
  });

  casoDeBanco("atender quem pagou adiantado move o valor para 'recebido'", async () => {
    const appt = await criar({ status: "confirmed", paymentStatus: "paid", price: "80.00" });

    expect(await repository.sumPrepaidRevenue()).toBe(80);
    expect(await repository.sumReceivedRevenue()).toBe(0);

    await prisma.appointment.update({ where: { id: appt.id }, data: { status: "completed" } });

    expect(await repository.sumPrepaidRevenue()).toBe(0);
    expect(await repository.sumReceivedRevenue()).toBe(80);
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
    expect(await repository.sumPrepaidRevenue()).toBe(0);
    expect(await repository.sumPendingRevenue()).toBe(0);
  });

  beforeEach(async () => {
    if (bancoDisponivel) {
      await prisma.appointmentService.deleteMany({});
      await prisma.appointment.deleteMany({});
    }
  });
});
