import { formatDateOnly, formatShortDate, formatTime } from "./formatDate";
import { formatBRL } from "./formatCurrency";
import { formatServiceNames } from "./formatServices";

export function mapAppointment(dto) {
  return {
    id: dto.id,
    status: dto.status,
    scheduledAt: dto.scheduledAt,
    // "service" é a linha pronta para exibição; "services" mantém a lista
    // original para quem precisar dos itens separados.
    service: formatServiceNames(dto.services),
    services: dto.services,
    professional: dto.employee?.fullName ?? "Sem preferência",
    professionalAvatarUrl: dto.employee?.avatarUrl ?? null,
    employeeId: dto.employee?.id ?? null,
    client: dto.client?.fullName,
    clientAvatarUrl: dto.client?.avatarUrl ?? null,
    date: formatDateOnly(dto.scheduledAt),
    dateShort: formatShortDate(dto.scheduledAt),
    time: formatTime(dto.scheduledAt),
    price: formatBRL(dto.price),
    priceValue: dto.price,
    // Usados pelo detalhe expandido do histórico.
    durationMinutes: dto.durationMinutes,
    paymentMethod: dto.paymentMethod,
    paymentStatus: dto.paymentStatus,
    notes: dto.notes ?? null,
  };
}
