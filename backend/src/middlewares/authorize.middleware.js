import { AppError } from "../utils/AppError.js";

// owner tem acesso total e nunca é bloqueado por uma permission específica.
export function authorize(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (req.user.role === "owner") {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
}
