import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/contexts/useAuth";
import { ROLE_HOME_ROUTE } from "../../shared/constants/roleHomeRoutes";
import LoadingScreen from "../../shared/components/LoadingScreen";

export default function PrivateRoute({ allowedRoles }) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
    return <Navigate to={ROLE_HOME_ROUTE[user?.role?.name] ?? "/login"} replace />;
  }

  return <Outlet />;
}
