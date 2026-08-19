import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must have at least 8 characters")
  .max(72, "Password must have at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");
