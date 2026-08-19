import * as appointmentsService from "../services/appointments.service.js";

export async function listAppointments(req, res, next) {
  try {
    const appointments = await appointmentsService.listAppointments(req.user, req.query);
    res.status(200).json({ success: true, data: appointments });
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
