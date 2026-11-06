import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../shared/contexts/useAuth";
import { ROLES } from "../../shared/constants/roles";
import { ROLE_HOME_ROUTE } from "../../shared/constants/roleHomeRoutes";
import LoadingScreen from "../../shared/components/LoadingScreen";

const COMPLETE_PROFILE_ROUTE = "/complete-profile";

export default function PrivateRoute({ allowedRoles }) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Conta criada pelo Google entra sem telefone, e o salão precisa dele para
  // confirmar horários. Vale só para cliente: a equipe (owner/admin/funcionária)
  // não agenda para si mesma e ficaria presa aqui à toa.
  const needsPhoneNumber = user?.role?.name === ROLES.CLIENT && !user?.phoneNumber;
  if (needsPhoneNumber && location.pathname !== COMPLETE_PROFILE_ROUTE) {
    return <Navigate to={COMPLETE_PROFILE_ROUTE} replace />;
  }

  // Já preencheu o telefone: não faz sentido voltar a essa tela.
  if (!needsPhoneNumber && location.pathname === COMPLETE_PROFILE_ROUTE) {
    return <Navigate to={ROLE_HOME_ROUTE[user?.role?.name] ?? "/dashboard"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role?.name)) {
    return <Navigate to={ROLE_HOME_ROUTE[user?.role?.name] ?? "/login"} replace />;
  }

  return <Outlet />;
}
