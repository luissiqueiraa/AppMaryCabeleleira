import { z } from "zod";
import { passwordSchema } from "./password.schema.js";
import { emailSchema } from "./common.validator.js";

export const createEmployeeSchema = {
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    phoneNumber: z.string().trim().min(8).max(20).optional(),
    hireDate: z.coerce.date().optional(),
  }),
};
