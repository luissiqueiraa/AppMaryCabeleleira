import { z } from "zod";
import { idParamSchema } from "./common.validator.js";

// Mesmo formato do agendamento: a cobrança descreve o atendimento pretendido,
// porque o horário só vira agendamento depois do pagamento aprovado.
export const createPaymentSchema = {
  body: z.object({
    serviceIds: z
      .array(z.string().uuid())
      .min(1, "Selecione ao menos um serviço")
      .max(10, "Selecione no máximo 10 serviços"),
    employeeId: z.string().uuid("Selecione uma profissional"),
    scheduledAt: z.coerce.date(),
    // "on_site" não gera cobrança: vai direto por POST /appointments.
    method: z.enum(["pix", "card"]),
    notes: z.string().trim().max(500).optional(),
  }),
};

export const getPaymentSchema = idParamSchema;
