import { prisma } from "../config/database.js";

const INCLUDE = {
  // Ordem estável por nome: os itens são criados em lote e o createdAt empata.
  services: { include: { service: true }, orderBy: { service: { name: "asc" } } },
  employee: { include: { user: true } },
  client: true,
};

export function findAppointmentById(id) {
  return prisma.appointment.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
}

function buildAppointmentsWhere({ clientId, employeeId, status, dateFrom, dateTo, search }) {
  return {
    deletedAt: null,
    ...(clientId ? { clientId } : {}),
    ...(employeeId ? { employeeId } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom || dateTo
      ? { scheduledAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lt: dateTo } : {}) } }
      : {}),
    ...(search
      ? {
          OR: [
            { client: { fullName: { contains: search, mode: "insensitive" } } },
            { services: { some: { service: { name: { contains: search, mode: "insensitive" } } } } },
          ],
        }
      : {}),
  };
}

export function findAppointments({
  clientId,
  employeeId,
  status,
  dateFrom,
  dateTo,
  search,
  skip,
  take,
  order = "asc",
} = {}) {
  return prisma.appointment.findMany({
    where: buildAppointmentsWhere({ clientId, employeeId, status, dateFrom, dateTo, search }),
    include: INCLUDE,
    orderBy: { scheduledAt: order },
    skip,
    take,
  });
}

export function countAppointments({ clientId, employeeId, status, dateFrom, dateTo, search } = {}) {
  return prisma.appointment.count({
    where: buildAppointmentsWhere({ clientId, employeeId, status, dateFrom, dateTo, search }),
  });
}

// Usado só para conflict-check: agendamentos do profissional que ocupam a
// agenda no dia. "completed" entra na lista — o atendimento aconteceu, o
// horário foi gasto, e concluir antes da hora não pode liberar a vaga. Só
// "cancelled" (e o soft delete) devolvem o horário. A mesma regra está na
// constraint appointments_employee_no_overlap, no banco.
export const OCCUPYING_STATUSES = ["pending", "confirmed", "completed"];

export function findActiveAppointmentsForEmployeeOnDay({ employeeId, dayStart, dayEnd, excludeId }) {
  return prisma.appointment.findMany({
    where: {
      employeeId,
      deletedAt: null,
      status: { in: OCCUPYING_STATUSES },
      scheduledAt: { gte: dayStart, lt: dayEnd },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

// Caixa do salão: dinheiro que entrou de fato — atendimento concluído E
// pagamento confirmado. Concluir diz que o serviço aconteceu; quem diz que o
// valor entrou é o paymentStatus (no pix/cartão vem do provedor, no presencial
// a equipe confirma no painel).
// Agregado no banco, e não somando a lista no navegador, porque o histórico
// só cresce.
export function sumReceivedRevenue({ from, to } = {}) {
  return sumPrice({ status: "completed", paymentStatus: "paid", ...dateRange({ from, to }) });
}

// O oposto: valor combinado que ainda não entrou. Inclui o que já foi atendido
// e não foi pago e o que está agendado para frente; cancelado não conta.
export function sumPendingRevenue({ from, to } = {}) {
  return sumPrice({
    status: { in: ["pending", "confirmed", "completed"] },
    paymentStatus: "pending",
    ...dateRange({ from, to }),
  });
}

function dateRange({ from, to }) {
  if (!from && !to) return {};
  return { scheduledAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } };
}

async function sumPrice(where) {
  const result = await prisma.appointment.aggregate({
    _sum: { price: true },
    where: { deletedAt: null, ...where },
  });
  return Number(result._sum.price ?? 0);
}

// "services" chega como a lista de itens ({ serviceId, durationMinutes, price })
// e é criada junto com o agendamento — nunca existe agendamento sem serviço.
export function createAppointment({ services, ...data }) {
  return prisma.appointment.create({
    data: { ...data, services: { create: services } },
    include: INCLUDE,
  });
}

export function updateAppointment(id, data) {
  return prisma.appointment.update({ where: { id }, data, include: INCLUDE });
}

// Soft delete, como no resto do sistema: a linha fica no banco (auditoria,
// relatório antigo) mas sai de todas as listas, do caixa e do conflito de
// horário — a constraint de sobreposição também ignora deletado.
export function softDeleteAppointment(id) {
  return prisma.appointment.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: INCLUDE,
  });
}
