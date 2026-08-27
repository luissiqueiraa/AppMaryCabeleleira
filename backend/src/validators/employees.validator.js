import { z } from "zod";
import { staffPasswordSchema } from "./password.schema.js";
import { emailSchema } from "./common.validator.js";

export const createEmployeeSchema = {
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: staffPasswordSchema,
    phoneNumber: z.string().trim().min(8).max(20).optional(),
    hireDate: z.coerce.date().optional(),
  }),
};

export const createEmployeeFromUserSchema = {
  body: z.object({
    userId: z.string().uuid("Invalid userId"),
    hireDate: z.coerce.date().optional(),
  }),
};

export const updateEmployeeSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
  body: z.object({
    fullName: z.string().trim().min(2).max(120).optional(),
    email: emailSchema.optional(),
    phoneNumber: z.string().trim().min(8).max(20).optional(),
    active: z.boolean().optional(),
  }),
};
