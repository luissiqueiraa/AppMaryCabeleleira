import { prisma } from "../config/database.js";

const INCLUDE = { service: true, employee: { include: { user: true } }, client: true };

export function findAppointmentById(id) {
  return prisma.appointment.findFirst({ where: { id, deletedAt: null }, include: INCLUDE });
}

export function findAppointments({ clientId, employeeId, status, dateFrom, dateTo } = {}) {
  return prisma.appointment.findMany({
    where: {
      deletedAt: null,
      ...(clientId ? { clientId } : {}),
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status } : {}),
      ...(dateFrom || dateTo
        ? { scheduledAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lt: dateTo } : {}) } }
        : {}),
    },
    include: INCLUDE,
    orderBy: { scheduledAt: "asc" },
  });
}

// Usado só para conflict-check: agendamentos ativos do profissional no dia.
export function findActiveAppointmentsForEmployeeOnDay({ employeeId, dayStart, dayEnd, excludeId }) {
  return prisma.appointment.findMany({
    where: {
      employeeId,
      deletedAt: null,
      status: { in: ["pending", "confirmed"] },
      scheduledAt: { gte: dayStart, lt: dayEnd },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export function createAppointment(data) {
  return prisma.appointment.create({ data, include: INCLUDE });
}

export function updateAppointment(id, data) {
  return prisma.appointment.update({ where: { id }, data, include: INCLUDE });
}
