import { z } from "zod";

// Lista fechada de propósito: o ícone é uma chave que o frontend traduz para um
// componente. Texto livre aqui viraria ícone inexistente na vitrine. Precisa
// casar com frontend/src/shared/constants/categoryIcons.js.
export const CATEGORY_ICONS = [
  "scissors",
  "droplet",
  "sun",
  "wind",
  "heart",
  "star",
  "smile",
  "feather",
  "award",
  "zap",
  "eye",
  "gift",
];

const iconEnum = z.enum(CATEGORY_ICONS);

export const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(2, "Name must have at least 2 characters").max(60),
    icon: iconEnum.optional(),
    sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: z.string().uuid("Invalid id") }),
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    icon: iconEnum.optional(),
    sortOrder: z.coerce.number().int().min(0).max(999).optional(),
    active: z.boolean().optional(),
  }),
};
