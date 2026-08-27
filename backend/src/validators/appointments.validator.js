import { z } from "zod";
import { idParamSchema } from "./common.validator.js";

const appointmentStatusEnum = z.enum(["pending", "confirmed", "completed", "cancelled"]);
const isoDateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const listAppointmentsSchema = {
  query: z.object({
    status: appointmentStatusEnum.optional(),
    employeeId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
    date: isoDateOnly.optional(),
    from: isoDateOnly.optional(),
    to: isoDateOnly.optional(),
    search: z.string().trim().min(1).max(120).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
};

export const getAppointmentSchema = idParamSchema;
export const cancelAppointmentSchema = idParamSchema;

// Escolher uma cabeleireira é obrigatório: sem isso o conflict-check
// (assertNoConflict) não roda e dois clientes podem marcar o mesmo horário.
export const createAppointmentSchema = {
  body: z.object({
    serviceId: z.string().uuid(),
    employeeId: z.string().uuid("Selecione uma profissional"),
    scheduledAt: z.coerce.date(),
    payOnSite: z.boolean().optional().default(true),
    notes: z.string().trim().max(500).optional(),
  }),
};

export const rescheduleAppointmentSchema = {
  params: idParamSchema.params,
  body: z.object({
    scheduledAt: z.coerce.date(),
    employeeId: z.string().uuid().optional(),
  }),
};

export const availabilitySchema = {
  query: z.object({
    employeeId: z.string().uuid(),
    date: isoDateOnly,
    excludeId: z.string().uuid().optional(),
  }),
};

export const updateAppointmentStatusSchema = {
  params: idParamSchema.params,
  body: z.object({ status: z.enum(["confirmed", "completed", "cancelled"]) }),
};
