import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as appointmentsRepository from "../repositories/appointments.repository.js";
import * as servicesRepository from "../repositories/services.repository.js";
import * as employeesRepository from "../repositories/employees.repository.js";
import * as notificationsService from "./notifications.service.js";

const ACTIVE_STATUSES = ["confirmed"];

const LEGAL_TRANSITIONS = {
  confirmed: ["completed", "cancelled"],
};

function toAppointmentDto(appointment) {
  return {
    id: appointment.id,
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    price: Number(appointment.price),
    payOnSite: appointment.payOnSite,
    notes: appointment.notes,
    service: { id: appointment.service.id, name: appointment.service.name },
    employee: appointment.employee
      ? { id: appointment.employee.id, fullName: appointment.employee.user.fullName }
      : null,
    client: {
      id: appointment.client.id,
      fullName: appointment.client.fullName,
      phoneNumber: appointment.client.phoneNumber,
    },
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

function resolveDateRange({ date, from, to }) {
  if (date) {
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    return { dateFrom: dayStart, dateTo: dayEnd };
  }
  return {
    dateFrom: from ? new Date(`${from}T00:00:00`) : undefined,
    dateTo: to ? new Date(`${to}T00:00:00`) : undefined,
  };
}

function overlaps(existing, newStart, newEnd) {
  const existingEnd = new Date(existing.scheduledAt.getTime() + existing.durationMinutes * 60000);
  return newStart < existingEnd && existing.scheduledAt < newEnd;
}

async function assertNoConflict({ employeeId, scheduledAt, durationMinutes, excludeId }) {
  if (!employeeId) return; // "sem preferência": não checado nesta fase (limitação conhecida)
  const dayStart = new Date(scheduledAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const candidates = await appointmentsRepository.findActiveAppointmentsForEmployeeOnDay({
    employeeId,
    dayStart,
    dayEnd,
    excludeId,
  });
  const newEnd = new Date(scheduledAt.getTime() + durationMinutes * 60000);
  if (candidates.some((candidate) => overlaps(candidate, scheduledAt, newEnd))) {
    throw new AppError("This professional is not available at the selected time", 409);
  }
}

export async function getAppointmentOwnerId(id) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  return appointment?.clientId ?? null;
}

export async function listAppointments(actor, query) {
  const canManage = actor.permissions.includes("manage_appointments");
  const { dateFrom, dateTo } = resolveDateRange(query);
  const filters = {
    clientId: canManage ? query.clientId : actor.id,
    employeeId: query.employeeId,
    status: query.status,
    dateFrom,
    dateTo,
    search: query.search,
  };

  if (!query.page) {
    const appointments = await appointmentsRepository.findAppointments(filters);
    return { items: appointments.map(toAppointmentDto), pagination: null };
  }

  const limit = query.limit ?? 20;
  const page = query.page;
  const [appointments, total] = await Promise.all([
    appointmentsRepository.findAppointments({
      ...filters,
      skip: (page - 1) * limit,
      take: limit,
      order: query.order,
    }),
    appointmentsRepository.countAppointments(filters),
  ]);

  return {
    items: appointments.map(toAppointmentDto),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Disponibilidade de horário é cross-cliente por natureza: qualquer cliente
// autenticado precisa enxergar os horários ocupados de uma profissional pra
// não marcar em cima de outra pessoa. Por isso não passa pelo scoping de
// listAppointments (que restringe um cliente comum aos próprios agendamentos)
// — só devolve os intervalos ocupados, sem nome/telefone/serviço de ninguém.
export async function getAvailability({ employeeId, date, excludeId }) {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const appointments = await appointmentsRepository.findActiveAppointmentsForEmployeeOnDay({
    employeeId,
    dayStart,
    dayEnd,
    excludeId,
  });
  return appointments.map((item) => ({
    scheduledAt: item.scheduledAt,
    durationMinutes: item.durationMinutes,
  }));
}

export async function getAppointmentById(id) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  return toAppointmentDto(appointment);
}

export async function createAppointment({ serviceId, employeeId, scheduledAt, payOnSite, notes }, req) {
  if (scheduledAt <= new Date()) {
    throw new AppError("Appointment must be scheduled in the future", 422);
  }

  const service = await servicesRepository.findServiceById(serviceId);
  if (!service || !service.active) {
    throw new AppError("Service not found", 404);
  }

  if (employeeId) {
    const employee = await employeesRepository.findEmployeeById(employeeId);
    if (!employee || !employee.active) {
      throw new AppError("Employee not found", 404);
    }
  }

  await assertNoConflict({ employeeId, scheduledAt, durationMinutes: service.duration });

  const appointment = await appointmentsRepository.createAppointment({
    clientId: req.user.id,
    employeeId: employeeId ?? null,
    serviceId,
    scheduledAt,
    durationMinutes: service.duration,
    price: service.price,
    payOnSite,
    notes,
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "appointment.create",
    entity: "Appointment",
    entityId: appointment.id,
    req,
  });
  await notificationsService.notifyUser(appointment.clientId, {
    type: "confirmation",
    title: "Agendamento confirmado",
    description: `${appointment.service.name} confirmado para ${appointment.scheduledAt.toLocaleDateString("pt-BR")}.`,
  });
  return toAppointmentDto(appointment);
}

export async function rescheduleAppointment(id, { scheduledAt, employeeId }, req) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  if (["completed", "cancelled"].includes(appointment.status)) {
    throw new AppError("This appointment can no longer be rescheduled", 409);
  }
  if (scheduledAt <= new Date()) {
    throw new AppError("Appointment must be scheduled in the future", 422);
  }

  const nextEmployeeId = employeeId !== undefined ? employeeId : appointment.employeeId;
  await assertNoConflict({
    employeeId: nextEmployeeId,
    scheduledAt,
    durationMinutes: appointment.durationMinutes,
    excludeId: id,
  });

  const updated = await appointmentsRepository.updateAppointment(id, {
    scheduledAt,
    employeeId: nextEmployeeId,
    status: "pending", // remarcar sempre exige reconfirmação da equipe
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "appointment.reschedule",
    entity: "Appointment",
    entityId: id,
    req,
  });
  await notificationsService.notifyUser(updated.clientId, {
    type: "update",
    title: "Agendamento remarcado",
    description: `${updated.service.name} remarcado para ${updated.scheduledAt.toLocaleDateString("pt-BR")}.`,
  });
  return toAppointmentDto(updated);
}

export async function cancelAppointment(id, req) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }
  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    throw new AppError("This appointment can no longer be cancelled", 409);
  }

  const updated = await appointmentsRepository.updateAppointment(id, { status: "cancelled" });
  await recordAuditLog({
    userId: req.user.id,
    action: "appointment.cancel",
    entity: "Appointment",
    entityId: id,
    req,
  });
  await notificationsService.notifyUser(updated.clientId, {
    type: "update",
    title: "Agendamento cancelado",
    description: `${updated.service.name} de ${updated.scheduledAt.toLocaleDateString("pt-BR")} foi cancelado.`,
  });
  return toAppointmentDto(updated);
}

export async function updateAppointmentStatus(id, { status }, req) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  const allowed = LEGAL_TRANSITIONS[appointment.status] ?? [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot transition appointment from ${appointment.status} to ${status}`, 409);
  }

  const updated = await appointmentsRepository.updateAppointment(id, { status });
  await recordAuditLog({
    userId: req.user.id,
    action: "appointment.status_update",
    entity: "Appointment",
    entityId: id,
    req,
  });

  if (status === "cancelled") {
    await notificationsService.notifyUser(updated.clientId, {
      type: "update",
      title: "Agendamento cancelado",
      description: `${updated.service.name} de ${updated.scheduledAt.toLocaleDateString("pt-BR")} foi cancelado.`,
    });
  }

  return toAppointmentDto(updated);
}
