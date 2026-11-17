import * as clientsRepository from "../repositories/clients.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";

const RECENT_WINDOW_DAYS = 60;

// Situações que ainda vão acontecer. "completed" não entra: já aconteceu.
const UPCOMING_STATUSES = ["pending", "confirmed"];

function toClientDto(user) {
  const agendamentos = user.clientAppointments;

  // Visita é atendimento que aconteceu.
  const completed = agendamentos.filter((item) => item.status === "completed");
  const visits = completed.length;

  // Gasto é dinheiro confirmado, não atendimento concluído: quem pagou o pix
  // de um horário de amanhã já tirou o valor do bolso, e quem foi atendida sem
  // pagar não gastou nada ainda. Antes isto somava "completed" ignorando o
  // pagamento, então a cliente que pagou e não foi atendida aparecia com R$ 0.
  // Cancelado fica fora: valor de agendamento cancelado é devolução.
  const spent = agendamentos
    .filter((item) => item.paymentStatus === "paid" && item.status !== "cancelled")
    .reduce((sum, item) => sum + Number(item.price), 0);

  const lastVisit = completed
    .map((item) => item.scheduledAt)
    .sort((a, b) => b - a)[0] ?? null;

  const agora = Date.now();

  // Quem tem horário marcado está ativa, por definição — antes a segmentação
  // olhava só a última visita, então a cliente que acabou de agendar (e até
  // pagar) caía em "Inativas", que é a lista de quem se quer reconquistar.
  const temHorarioMarcado = agendamentos.some(
    (item) => UPCOMING_STATUSES.includes(item.status) && new Date(item.scheduledAt).getTime() >= agora
  );

  const visitouRecentemente =
    Boolean(lastVisit) && agora - new Date(lastVisit).getTime() <= RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  // Ordem importa: horário marcado fala do futuro e vale mais que a última
  // visita para saber se vale a pena buscar essa cliente.
  const segment = temHorarioMarcado ? "upcoming" : visitouRecentemente ? "recent" : "inactive";

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    visits,
    spent,
    lastVisit,
    segment,
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
