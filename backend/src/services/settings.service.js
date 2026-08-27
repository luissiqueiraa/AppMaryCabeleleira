import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as settingsRepository from "../repositories/settings.repository.js";

function toSettingsDto(settings) {
  return {
    name: settings.name,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    hours: settings.hours,
    updatedAt: settings.updatedAt,
  };
}

export async function getSettings() {
  const settings = await settingsRepository.findSettings();
  if (!settings) {
    throw new AppError("Salon settings are not configured", 404);
  }
  return toSettingsDto(settings);
}

export async function updateSettings(payload, req) {
  const settings = await settingsRepository.findSettings();
  if (!settings) {
    throw new AppError("Salon settings are not configured", 404);
  }

  const updated = await settingsRepository.updateSettings(settings.id, payload);
  await recordAuditLog({
    userId: req.user.id,
    action: "settings.update",
    entity: "SalonSettings",
    entityId: settings.id,
    req,
  });
  return toSettingsDto(updated);
}
