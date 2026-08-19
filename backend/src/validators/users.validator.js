import { z } from "zod";

export const listUsersQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};

export const userIdParamSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
};

export const assignRoleSchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
  body: z.object({
    roleId: z.string().uuid("Invalid roleId"),
  }),
};
