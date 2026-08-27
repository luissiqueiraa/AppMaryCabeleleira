import { prisma } from "../config/database.js";

const INCLUDE = { service: true, employee: { include: { user: true } }, client: true };

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
            { service: { name: { contains: search, mode: "insensitive" } } },
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
