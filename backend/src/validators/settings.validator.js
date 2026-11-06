import { z } from "zod";

const businessHourSchema = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  open: z.string(),
  close: z.string(),
});

export const updateSettingsSchema = {
  body: z.object({
    name: z.string().trim().min(1).max(120).optional(),
    address: z.string().trim().max(255).optional(),
    phone: z.string().trim().max(30).optional(),
    email: z.string().trim().email("Invalid email address").optional(),
    hours: z.array(businessHourSchema).length(7).optional(),
  }),
};

export const resetSystemSchema = {
  body: z.object({
    // A frase em si é conferida no service (ele é dono da regra); aqui só
    // garantimos que veio alguma coisa.
    confirmation: z.string().min(1, "Digite a frase de confirmação"),
    password: z.string().min(1).optional(),
  }),
};
