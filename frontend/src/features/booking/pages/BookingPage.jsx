import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLES } from "../../../shared/constants/roles";
import LoadingScreen from "../../../shared/components/LoadingScreen";

// Ponte entre a home e o fluxo de agendamento do app. Não duplica nada do
// fluxo: só decide para onde a cliente vai.
//
// - sem conta  -> login (que volta para cá depois de entrar)
// - com conta  -> fluxo de agendamento, já com a profissional escolhida na home
// - equipe     -> painel; funcionária e admin não agendam para si mesmas
export default function BookingPage() {
  const { user, isAuthenticated, isBootstrapping } = useAuth();
  const [searchParams] = useSearchParams();

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  const professionalId = searchParams.get("profissional");
  const destino = professionalId
    ? `/appointments/new?profissional=${encodeURIComponent(professionalId)}`
    : "/appointments/new";

  if (!isAuthenticated) {
    // O "next" preserva a escolha feita na home: depois de entrar, a cliente
    // cai direto no agendamento em vez de voltar para o painel.
    return <Navigate to={`/login?next=${encodeURIComponent(destino)}`} replace />;
  }

  const isStaff = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE].includes(user?.role?.name);
  return <Navigate to={isStaff ? "/admin" : destino} replace />;
}
