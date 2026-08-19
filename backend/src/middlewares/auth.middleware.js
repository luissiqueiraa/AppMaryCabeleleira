import { verifyAccessToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";

// Nunca confiar no token sem verificar assinatura e validade.
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
}
