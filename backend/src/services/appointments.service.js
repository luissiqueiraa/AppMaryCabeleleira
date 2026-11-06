import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as appointmentsRepository from "../repositories/appointments.repository.js";
import * as servicesRepository from "../repositories/services.repository.js";
import * as employeesRepository from "../repositories/employees.repository.js";
import * as settingsRepository from "../repositories/settings.repository.js";
import * as notificationsService from "./notifications.service.js";

// Agendamento que ainda ocupa a agenda e pode ser cancelado. "pending" entra
// aqui porque, se existir (dado legado ou futura etapa de aprovação), precisa
// ter saída: antes ele não podia ser cancelado nem concluído e ficava travado
// para sempre, ocupando o horário.
const ACTIVE_STATUSES = ["pending", "confirmed"];

const LEGAL_TRANSITIONS = {
  pending: ["confirmed", "completed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

// Nome dos serviços em uma linha só, para notificações e mensagens.
function describeServices(appointment) {
  return appointment.services.map((item) => item.service.name).join(" + ");
}

function toAppointmentDto(appointment) {
  return {
    id: appointment.id,
    status: appointment.status,
    scheduledAt: appointment.scheduledAt,
    // durationMinutes e price são os totais do agendamento; a quebra por
    // serviço vai em "services".
    durationMinutes: appointment.durationMinutes,
    price: Number(appointment.price),
    paymentMethod: appointment.paymentMethod,
    paymentStatus: appointment.paymentStatus,
    notes: appointment.notes,
    services: appointment.services.map((item) => ({
      id: item.service.id,
      name: item.service.name,
      durationMinutes: item.durationMinutes,
      price: Number(item.price),
    })),
    employee: appointment.employee
      ? {
          id: appointment.employee.id,
          fullName: appointment.employee.user.fullName,
          avatarUrl: appointment.employee.user.avatarUrl,
        }
      : null,
    client: {
      id: appointment.client.id,
      fullName: appointment.client.fullName,
      phoneNumber: appointment.client.phoneNumber,
      avatarUrl: appointment.client.avatarUrl,
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

// Mesmos ids usados em SalonSettings.hours, na ordem de Date#getDay.
const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toMinutes(hhmm) {
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

// scheduledAt é um instante (UTC no banco); o expediente é hora de parede.
// Intl converte um pelo outro respeitando o horário de verão do fuso.
function salonWallClock(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: env.salonTimeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value;
  const weekdayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value("weekday"));
  // "24" aparece no lugar de "00" em algumas versões do ICU.
  const hour = Number(value("hour")) % 24;
  return { weekdayId: WEEKDAY_IDS[weekdayIndex], minutes: hour * 60 + Number(value("minute")) };
}

// Caixa do salão: o que entrou (atendido e pago) e o que ainda falta entrar.
// As funções do repositório aceitam intervalo, caso um dia o painel queira
// recortar por período.
export async function getRevenueSummary() {
  const [total, pending] = await Promise.all([
    appointmentsRepository.sumReceivedRevenue(),
    appointmentsRepository.sumPendingRevenue(),
  ]);
  return { total, pending };
}

// O frontend só oferece horários dentro do expediente, mas quem chama a API
// direto não passa por essa grade. O atendimento tem de começar e TERMINAR
// dentro do horário de funcionamento: ninguém fica no salão depois de fechar.
async function assertWithinBusinessHours(scheduledAt, durationMinutes = 0) {
  const settings = await settingsRepository.findSettings();
  const { weekdayId, minutes } = salonWallClock(scheduledAt);
  const dayHours = settings?.hours?.find((day) => day.id === weekdayId);
  // Sem configuração não há o que cobrar — nada de travar a agenda por causa
  // de um cadastro de horários incompleto.
  if (!dayHours) return;

  if (!dayHours.enabled || !dayHours.open || !dayHours.close) {
    throw new AppError("The salon is closed on the selected day", 422);
  }
  if (minutes < toMinutes(dayHours.open) || minutes >= toMinutes(dayHours.close)) {
    throw new AppError("Selected time is outside the salon opening hours", 422);
  }
  // O fim também conta: um corte de 90 min às 18:30 terminaria com o salão
  // fechado. A mensagem é separada porque a saída é outra — a cliente precisa
  // escolher um horário mais cedo ou outro dia, não um dia "aberto".
  if (minutes + durationMinutes > toMinutes(dayHours.close)) {
    throw new AppError("Appointment would end after the salon closes", 422);
  }
}

// Nome da constraint de exclusão criada em
// 20260923140000_prevent_overlapping_appointments.
const OVERLAP_CONSTRAINT = "appointments_employee_no_overlap";
const UNAVAILABLE_MESSAGE = "This professional is not available at the selected time";

// assertNoConflict resolve o caso normal, mas duas clientes que confirmam ao
// mesmo tempo passam as duas por ele — ambas leem a agenda antes de qualquer
// uma gravar. Quem arbitra de verdade é o banco, e a recusa dele chega aqui
// como erro cru: traduzimos para o mesmo 409 do conflito comum.
async function guardingOverlap(write) {
  try {
    return await write();
  } catch (error) {
    if (String(error?.message ?? "").includes(OVERLAP_CONSTRAINT)) {
      throw new AppError(UNAVAILABLE_MESSAGE, 409);
    }
    throw error;
  }
}

async function assertNoConflict({ employeeId, scheduledAt, durationMinutes, excludeId }) {
  // Criar e remarcar exigem profissional, e a FK é Restrict: só dado legado
  // chega aqui sem employeeId, e esse não ocupa a agenda de ninguém.
  if (!employeeId) return;
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
    throw new AppError(UNAVAILABLE_MESSAGE, 409);
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

// Tudo que precisa valer antes de ocupar a agenda: data no futuro, salão
// aberto, serviços ativos, profissional ativa e horário livre. Compartilhado
// por quem agenda direto (pagando no salão) e por quem paga antes — o segundo
// caminho chama isto duas vezes, ao abrir a cobrança e ao confirmá-la.
export async function prepareBooking({ serviceIds, employeeId, scheduledAt }) {
  if (scheduledAt <= new Date()) {
    throw new AppError("Appointment must be scheduled in the future", 422);
  }

  // A cliente pode combinar vários procedimentos numa ida só: o atendimento
  // ocupa a soma das durações e custa a soma dos preços.
  const uniqueServiceIds = [...new Set(serviceIds)];
  const found = await servicesRepository.findServicesByIds(uniqueServiceIds);
  const selectedServices = uniqueServiceIds.map((id) => found.find((item) => item.id === id));
  if (selectedServices.some((service) => !service || !service.active)) {
    throw new AppError("Service not found", 404);
  }

  const durationMinutes = selectedServices.reduce((total, service) => total + service.duration, 0);
  const price = selectedServices.reduce(
    (total, service) => total.plus(service.price),
    new Prisma.Decimal(0)
  );

  // Depois de somar a duração: o expediente é cobrado no início e no fim, e o
  // fim só é conhecido aqui.
  await assertWithinBusinessHours(scheduledAt, durationMinutes);

  if (employeeId) {
    const employee = await employeesRepository.findEmployeeById(employeeId);
    if (!employee || !employee.active) {
      throw new AppError("Employee not found", 404);
    }
  }

  await assertNoConflict({ employeeId, scheduledAt, durationMinutes });

  return { services: selectedServices, durationMinutes, price };
}

// Agendamento com pagamento no salão: nasce confirmado na hora, porque não há
// cobrança a esperar. Pix e cartão não passam por aqui — vão por
// payments.service, que só cria o agendamento depois da aprovação.
export async function createAppointment({ serviceIds, employeeId, scheduledAt, notes }, req) {
  const { services: selectedServices, durationMinutes, price } = await prepareBooking({
    serviceIds,
    employeeId,
    scheduledAt,
  });

  const appointment = await guardingOverlap(() =>
    appointmentsRepository.createAppointment({
      clientId: req.user.id,
      employeeId: employeeId ?? null,
      scheduledAt,
      durationMinutes,
      price,
      paymentMethod: "on_site",
      paymentStatus: "pending",
      notes,
      services: selectedServices.map((service) => ({
        serviceId: service.id,
        durationMinutes: service.duration,
        price: service.price,
      })),
    })
  );

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
    description: `${describeServices(appointment)} confirmado para ${appointment.scheduledAt.toLocaleDateString("pt-BR")}.`,
  });
  return toAppointmentDto(appointment);
}

// Chamado quando o provedor confirma a cobrança. Revalida o horário: entre a
// cliente pagar e a baixa chegar, outra pode ter ficado com a vaga — é o custo
// da regra "reserva só após o pagamento". Nesse caso o erro sobe para
// payments.service, que marca a cobrança para devolução.
export async function createAppointmentForPayment(payment) {
  if (payment.scheduledAt <= new Date()) {
    throw new AppError("Appointment must be scheduled in the future", 409);
  }

  await assertNoConflict({
    employeeId: payment.employeeId,
    scheduledAt: payment.scheduledAt,
    durationMinutes: payment.durationMinutes,
  });

  // Preço vem do valor cobrado, não do catálogo: o agendamento tem de valer
  // exatamente o que a cliente pagou.
  const appointment = await guardingOverlap(() =>
    appointmentsRepository.createAppointment({
      clientId: payment.clientId,
      employeeId: payment.employeeId,
      scheduledAt: payment.scheduledAt,
      durationMinutes: payment.durationMinutes,
      price: payment.amount,
      paymentMethod: payment.method,
      paymentStatus: "paid",
      notes: payment.notes,
      services: payment.services.map((service) => ({
        serviceId: service.id,
        durationMinutes: service.durationMinutes,
        price: service.price,
      })),
    })
  );

  return appointment;
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

  // A duração já está congelada no agendamento: o novo horário também precisa
  // caber até o fechamento.
  await assertWithinBusinessHours(scheduledAt, appointment.durationMinutes);

  const nextEmployeeId = employeeId !== undefined ? employeeId : appointment.employeeId;
  await assertNoConflict({
    employeeId: nextEmployeeId,
    scheduledAt,
    durationMinutes: appointment.durationMinutes,
    excludeId: id,
  });

  // Remarcar mantém o agendamento confirmado. Antes ele voltava para
  // "pending" esperando uma reconfirmação da equipe que nenhuma tela oferece —
  // o resultado era um agendamento que ninguém conseguia cancelar nem
  // concluir. O horário novo já passou pelo conflict-check, então não há o que
  // aprovar: confirmado continua confirmado, e a cliente é avisada.
  const updated = await guardingOverlap(() =>
    appointmentsRepository.updateAppointment(id, {
      scheduledAt,
      employeeId: nextEmployeeId,
    })
  );

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
    description: `${describeServices(updated)} remarcado para ${updated.scheduledAt.toLocaleDateString("pt-BR")}.`,
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
    description: `${describeServices(updated)} de ${updated.scheduledAt.toLocaleDateString("pt-BR")} foi cancelado.`,
  });
  return toAppointmentDto(updated);
}

// Confirma (ou desfaz) o recebimento de um atendimento pago no salão. É uma
// decisão separada de "concluir": o serviço pode ter acontecido sem o dinheiro
// ter entrado, e é essa diferença que o caixa precisa respeitar.
export async function updateAppointmentPayment(id, { paymentStatus }, req) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  // Pix e cartão têm o provedor como fonte da verdade — a equipe não dá baixa
  // à mão num pagamento online, senão o caixa passa a mentir.
  if (appointment.paymentMethod !== "on_site") {
    throw new AppError("Online payments are confirmed by the payment provider", 422);
  }
  if (appointment.status === "cancelled") {
    throw new AppError("Cannot change the payment of a cancelled appointment", 422);
  }

  const updated = await appointmentsRepository.updateAppointment(id, { paymentStatus });
  await recordAuditLog({
    userId: req.user.id,
    action: paymentStatus === "paid" ? "appointment.payment_received" : "appointment.payment_reverted",
    entity: "Appointment",
    entityId: id,
    req,
  });

  if (paymentStatus === "paid") {
    await notificationsService.notifyUser(updated.clientId, {
      type: "confirmation",
      title: "Pagamento registrado",
      description: `O salão registrou o pagamento de ${describeServices(updated)}.`,
    });
  }

  return toAppointmentDto(updated);
}

// Exclusão é para erro de lançamento — agendamento que nunca deveria existir.
// Para "a cliente desistiu" o caminho é cancelar, que preserva o histórico.
// A diferença importa porque excluído sai do caixa e das listas.
export async function deleteAppointment(id, req) {
  const appointment = await appointmentsRepository.findAppointmentById(id);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  // Pix e cartão passaram por cobrança real: apagar esconderia dinheiro que
  // entrou, e o estorno é feito no provedor, não aqui.
  if (appointment.paymentMethod !== "on_site" && appointment.paymentStatus === "paid") {
    throw new AppError("Cannot delete an appointment paid online", 422);
  }

  await appointmentsRepository.softDeleteAppointment(id);
  await recordAuditLog({
    userId: req.user.id,
    action: "appointment.delete",
    entity: "Appointment",
    entityId: id,
    req,
  });
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
      description: `${describeServices(updated)} de ${updated.scheduledAt.toLocaleDateString("pt-BR")} foi cancelado.`,
    });
  }

  return toAppointmentDto(updated);
}
