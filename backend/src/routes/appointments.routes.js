import { Router } from "express";
import * as appointmentsController from "../controllers/appointments.controller.js";
import * as appointmentsService from "../services/appointments.service.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { authorizeOwnership } from "../middlewares/ownership.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  listAppointmentsSchema,
  getAppointmentSchema,
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  cancelAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointments.validator.js";

const router = Router();
router.use(authenticate);

const getAppointmentOwnerId = (req) => appointmentsService.getAppointmentOwnerId(req.params.id);

router.get("/", validateRequest(listAppointmentsSchema), appointmentsController.listAppointments);

router.get(
  "/:id",
  // validateRequest roda antes de authorizeOwnership: a lookup de dono faz uma
  // query Prisma pelo id, e um id malformado vira erro 500 do Postgres em vez
  // do 422 limpo do Zod se a ordem for invertida.
  validateRequest(getAppointmentSchema),
  authorizeOwnership(getAppointmentOwnerId, ["manage_appointments"]),
  appointmentsController.getAppointment
);

router.post("/", validateRequest(createAppointmentSchema), appointmentsController.createAppointment);

router.patch(
  "/:id/reschedule",
  validateRequest(rescheduleAppointmentSchema),
  authorizeOwnership(getAppointmentOwnerId, ["manage_appointments"]),
  appointmentsController.rescheduleAppointment
);

router.patch(
  "/:id/cancel",
  validateRequest(cancelAppointmentSchema),
  authorizeOwnership(getAppointmentOwnerId, ["manage_appointments"]),
  appointmentsController.cancelAppointment
);

router.patch(
  "/:id/status",
  authorize("manage_appointments"),
  validateRequest(updateAppointmentStatusSchema),
  appointmentsController.updateAppointmentStatus
);

export default router;
