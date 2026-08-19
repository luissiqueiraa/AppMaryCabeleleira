import { AppError } from "../utils/AppError.js";

// getOwnerId: (req) => Promise<string|null> | string|null — resolve o id do
// dono do recurso (ex: appointments.clientId, employees.userId). Cada módulo
// implementa a sua própria resolução; esta checagem fica genérica.
//
// bypassPermissions: quem tiver QUALQUER uma dessas permissions acessa o
// recurso mesmo sem ser o dono (ex: admin com manage_appointments vendo
// agendamentos de qualquer cliente).
export function authorizeOwnership(getOwnerId, bypassPermissions = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError("Authentication required", 401));
      }

      if (req.user.role === "owner") {
        return next();
      }

      const hasBypass = bypassPermissions.some((permission) =>
        req.user.permissions.includes(permission)
      );
      if (hasBypass) {
        return next();
      }

      const ownerId = await getOwnerId(req);
      if (!ownerId || ownerId !== req.user.id) {
        return next(new AppError("You do not have access to this resource", 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
