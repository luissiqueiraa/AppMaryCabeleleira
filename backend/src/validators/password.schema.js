import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must have at least 8 characters")
  .max(72, "Password must have at most 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

// Acesso de funcionária: senha definida pelo admin na hora do cadastro, sem
// as exigências de complexidade do cadastro público (maiúscula/número/etc.)
// — só um mínimo de tamanho.
export const staffPasswordSchema = z
  .string()
  .min(6, "Password must have at least 6 characters")
  .max(72, "Password must have at most 72 characters");

// Cadastro público (cliente): só exige tamanho, sem regras de complexidade —
// pedido explícito do produto para reduzir a fricção no registro.
export const registerPasswordSchema = z
  .string()
  .min(6, "Password must have at least 6 characters")
  .max(72, "Password must have at most 72 characters");
