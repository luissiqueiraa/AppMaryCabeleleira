import * as clientsRepository from "../repositories/clients.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";

const RECENT_WINDOW_DAYS = 60;

function toClientDto(user) {
  const completed = user.clientAppointments.filter((item) => item.status === "completed");
  const visits = completed.length;
  const spent = completed.reduce((sum, item) => sum + Number(item.price), 0);
  const lastVisit = completed
    .map((item) => item.scheduledAt)
    .sort((a, b) => b - a)[0] ?? null;

  const isRecent =
    lastVisit && Date.now() - new Date(lastVisit).getTime() <= RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    visits,
    spent,
    lastVisit,
    segment: isRecent ? "recent" : "inactive",
  };
}

export async function listClients() {
  const clients = await clientsRepository.findAllClients();
  return clients.map(toClientDto);
}

export async function deleteClient(id, req) {
  const user = await authRepository.findUserById(id);
  if (!user || user.role?.name !== "client") {
    throw new AppError("Client not found", 404);
  }

  await authRepository.softDeleteUser(id);
  await authRepository.revokeAllRefreshTokensForUser(id);
  await recordAuditLog({
    userId: req.user.id,
    action: "client.delete",
    entity: "User",
    entityId: id,
    req,
  });
}
