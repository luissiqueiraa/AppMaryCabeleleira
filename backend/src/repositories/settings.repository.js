import { prisma } from "../config/database.js";

export function findSettings() {
  return prisma.salonSettings.findFirst();
}

export function updateSettings(id, data) {
  return prisma.salonSettings.update({ where: { id }, data });
}
