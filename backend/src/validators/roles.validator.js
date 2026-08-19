import { z } from "zod";

const permissionKeysSchema = z.array(z.string().min(1)).optional();

export const createRoleSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(60),
    description: z.string().trim().max(255).optional(),
    permissionKeys: permissionKeysSchema,
  }),
};

export const updateRoleSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    description: z.string().trim().max(255).optional(),
    permissionKeys: permissionKeysSchema,
  }),
};
