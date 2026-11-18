import * as appointmentsService from "../services/appointments.service.js";
import { subscribeAppointmentChanges } from "../utils/appointmentEvents.js";

// Intervalo do "ping": proxies (Railway, navegador) derrubam conexão parada.
const HEARTBEAT_MS = 25000;

// GET /appointments/events — Server-Sent Events. A conexão fica aberta e cada
// mudança de agendamento chega como um evento "appointment". Não há resposta
// JSON: o corpo é o próprio fluxo, até a aba fechar.
export function streamAppointmentEvents(req, res) {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Desliga buffer de proxy (nginx e afins), senão os eventos chegam em lote.
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const send = (chunk) => {
    res.write(chunk);
    res.flush?.();
  };
  const sendEvent = (event, data) => send(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  sendEvent("ready", {});
  const unsubscribe = subscribeAppointmentChanges((change) => sendEvent("appointment", change));
  const heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}

export async function listAppointments(req, res, next) {
  try {
    const result = await appointmentsService.listAppointments(req.user, req.query);
    res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

export async function getAvailability(req, res, next) {
  try {
    const result = await appointmentsService.getAvailability(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAppointment(req, res, next) {
  try {
    const appointment = await appointmentsService.getAppointmentById(req.params.id);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const appointment = await appointmentsService.createAppointment(req.body, req);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function rescheduleAppointment(req, res, next) {
  try {
    const appointment = await appointmentsService.rescheduleAppointment(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const appointment = await appointmentsService.cancelAppointment(req.params.id, req);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const appointment = await appointmentsService.updateAppointmentStatus(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function getRevenueSummary(req, res, next) {
  try {
    const summary = await appointmentsService.getRevenueSummary();
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointmentPayment(req, res, next) {
  try {
    const appointment = await appointmentsService.updateAppointmentPayment(req.params.id, req.body, req);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function markAppointmentRefunded(req, res, next) {
  try {
    const appointment = await appointmentsService.markAppointmentRefunded(req.params.id, req);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    await appointmentsService.deleteAppointment(req.params.id, req);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
