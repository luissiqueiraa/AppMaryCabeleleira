// TODO: bloquear acesso com base em req.user.role
export function rbacMiddleware(...allowedRoles) {
  return (req, res, next) => {
    next();
  };
}
