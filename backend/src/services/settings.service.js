import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import { verifyPassword } from "../utils/password.js";
import * as settingsRepository from "../repositories/settings.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import { isOnlinePaymentEnabled } from "../config/mercadopago.js";

// Frase que a owner precisa digitar para o reset rodar. Existe para que o
// clique não seja reflexo: ninguém digita isso sem querer.
export const RESET_CONFIRMATION_PHRASE = "APAGAR TUDO";

function toSettingsDto(settings) {
  return {
    name: settings.name,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    logoUrl: settings.logoUrl,
    hours: settings.hours,
    // O fluxo de agendamento consulta isto para decidir se oferece pix/cartão:
    // sem chave do provedor configurada, só "pagar no salão".
    onlinePaymentsEnabled: isOnlinePaymentEnabled(),
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

export async function updateLogo(filename, req) {
  const settings = await settingsRepository.findSettings();
  if (!settings) {
    throw new AppError("Salon settings are not configured", 404);
  }

  const logoUrl = `/uploads/logos/${filename}`;
  const updated = await settingsRepository.updateSettings(settings.id, { logoUrl });
  await recordAuditLog({
    userId: req.user.id,
    action: "settings.update_logo",
    entity: "SalonSettings",
    entityId: settings.id,
    req,
  });
  return toSettingsDto(updated);
}

// Reset de fábrica: apaga os dados operacionais e recria o padrão. Só admin e
// owner chegam aqui (a rota já barra o resto), e ainda assim exige a frase
// digitada e — quando a conta tem senha local — a senha atual. Uma sessão
// esquecida aberta não pode ser suficiente para zerar o salão.
export async function resetSystem({ confirmation, password }, req) {
  if (confirmation !== RESET_CONFIRMATION_PHRASE) {
    throw new AppError("Reset confirmation phrase does not match", 422);
  }

  const actor = await authRepository.findUserById(req.user.id);
  if (!actor) {
    throw new AppError("User not found", 404);
  }

  // Conta criada pelo Google não tem senha para conferir; nesse caso a frase
  // digitada é a única trava possível.
  if (actor.passwordHash) {
    if (!password) {
      throw new AppError("Current password is required to reset the system", 422);
    }
    const isPasswordValid = await verifyPassword(password, actor.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 422);
    }
  }

  const { removed, settings } = await settingsRepository.resetToDefaults({ actorId: actor.id });

  // Auditoria depois do reset, de propósito: a trilha antiga some junto com o
  // resto, e este registro é o primeiro da base nova.
  await recordAuditLog({
    userId: actor.id,
    action: "settings.reset_system",
    entity: "System",
    entityId: null,
    req,
  });

  return { removed, settings: toSettingsDto(settings) };
}
