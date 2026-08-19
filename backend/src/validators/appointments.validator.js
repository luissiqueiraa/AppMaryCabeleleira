import { z } from "zod";
import { idParamSchema } from "./common.validator.js";

const appointmentStatusEnum = z.enum(["pending", "confirmed", "completed", "cancelled"]);
const isoDateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const listAppointmentsSchema = {
  query: z.object({
    status: appointmentStatusEnum.optional(),
    employeeId: z.string().uuid().optional(),
    date: isoDateOnly.optional(),
    from: isoDateOnly.optional(),
    to: isoDateOnly.optional(),
  }),
};

export const getAppointmentSchema = idParamSchema;
export const cancelAppointmentSchema = idParamSchema;

export const createAppointmentSchema = {
  body: z.object({
    serviceId: z.string().uuid(),
    employeeId: z.string().uuid().nullable().optional(),
    scheduledAt: z.coerce.date(),
    payOnSite: z.boolean().optional().default(true),
    notes: z.string().trim().max(500).optional(),
  }),
};

export const rescheduleAppointmentSchema = {
  params: idParamSchema.params,
  body: z.object({
    scheduledAt: z.coerce.date(),
    employeeId: z.string().uuid().nullable().optional(),
  }),
};

export const updateAppointmentStatusSchema = {
  params: idParamSchema.params,
  body: z.object({ status: z.enum(["confirmed", "completed", "cancelled"]) }),
};
