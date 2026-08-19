import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/contexts/useAuth";
import { ROLES } from "../../shared/constants/roles";

const ROLE_HOME_ROUTE = {
  [ROLES.OWNER]: "/admin",
  [ROLES.ADMIN]: "/admin",
  [ROLES.CLIENT]: "/dashboard",
};

export default function PrivateRoute({ allowedRoles }) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center bg-bg" />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
    return <Navigate to={ROLE_HOME_ROUTE[user?.role?.name] ?? "/login"} replace />;
  }

  return <Outlet />;
}
