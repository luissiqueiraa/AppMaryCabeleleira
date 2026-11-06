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

// Variante "OR" de authorize: passa se o ator tiver QUALQUER uma das
// permissions listadas (ex: manage_users OU a permission mais restrita
// view_clients, ambas destravando o mesmo endpoint de leitura).
export function authorizeAny(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (req.user.role === "owner") {
      return next();
    }

    const hasAnyPermission = permissions.some((permission) => req.user.permissions.includes(permission));

    if (!hasAnyPermission) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
}

// Checagem por papel, para o que não é questão de permission e sim de cargo —
// reset de fábrica, por exemplo. owner passa sempre, como nas outras variantes.
export function authorizeRoles(...roleNames) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (req.user.role !== "owner" && !roleNames.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    next();
  };
}
