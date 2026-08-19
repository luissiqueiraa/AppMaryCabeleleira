import { prisma } from "../config/database.js";

// Auditoria nunca deve derrubar a operação principal: falha aqui só é logada
// no console, nunca propagada para o caller.
export async function recordAuditLog({ userId = null, action, entity, entityId = null, req }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ipAddress: req?.ip ?? null,
        userAgent: req?.headers?.["user-agent"] ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
