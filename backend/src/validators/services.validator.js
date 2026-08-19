import { z } from "zod";

export const createServiceSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(500).optional(),
    duration: z.coerce.number().int().min(5).max(600),
    price: z.coerce.number().min(0).max(100000),
  }),
};

export const updateServiceSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(500).optional(),
    duration: z.coerce.number().int().min(5).max(600).optional(),
    price: z.coerce.number().min(0).max(100000).optional(),
    active: z.boolean().optional(),
  }),
};
