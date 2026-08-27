import { prisma } from "../config/database.js";

export function findAllClients() {
  return prisma.user.findMany({
    where: { deletedAt: null, role: { name: "client" } },
    include: { clientAppointments: { where: { deletedAt: null } } },
    orderBy: { createdAt: "desc" },
  });
}
