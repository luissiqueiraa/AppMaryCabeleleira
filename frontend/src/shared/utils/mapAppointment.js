import { formatDateOnly, formatShortDate, formatTime } from "./formatDate";
import { formatBRL } from "./formatCurrency";

export function mapAppointment(dto) {
  return {
    id: dto.id,
    status: dto.status,
    scheduledAt: dto.scheduledAt,
    service: dto.service.name,
    professional: dto.employee?.fullName ?? "Sem preferência",
    employeeId: dto.employee?.id ?? null,
    client: dto.client?.fullName,
    date: formatDateOnly(dto.scheduledAt),
    dateShort: formatShortDate(dto.scheduledAt),
    time: formatTime(dto.scheduledAt),
    price: formatBRL(dto.price),
    priceValue: dto.price,
  };
}
