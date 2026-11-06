import { prisma } from "../config/database.js";

export function createPayment(data) {
  return prisma.payment.create({ data });
}

export function findPaymentById(id) {
  return prisma.payment.findUnique({ where: { id }, include: { client: true } });
}

export function findPaymentByProviderId(providerPaymentId) {
  return prisma.payment.findUnique({ where: { providerPaymentId }, include: { client: true } });
}

export function updatePayment(id, data) {
  return prisma.payment.update({ where: { id }, data });
}

// Cobranças pendentes da cliente para o mesmo horário: evita duas tentativas
// simultâneas da mesma pessoa gerando dois pix do mesmo atendimento.
export function findPendingPaymentFor({ clientId, employeeId, scheduledAt }) {
  return prisma.payment.findFirst({
    where: {
      clientId,
      employeeId,
      scheduledAt,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
  });
}
