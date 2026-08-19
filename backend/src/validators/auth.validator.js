import { z } from "zod";
import { passwordSchema } from "./password.schema.js";
import { emailSchema } from "./common.validator.js";

export const registerSchema = {
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    phoneNumber: z.string().trim().min(8).max(20).optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required").max(72),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: emailSchema,
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: passwordSchema,
  }),
};
