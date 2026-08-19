import { z } from "zod";

export const idParamSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
};

export const emailSchema = z.string().trim().toLowerCase().email("Invalid email address").max(255);
