import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import BrandMark from "../../auth/components/BrandMark";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLE_HOME_ROUTE } from "../../../shared/constants/roleHomeRoutes";

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const homeRoute = isAuthenticated ? (ROLE_HOME_ROUTE[user?.role?.name] ?? "/dashboard") : "/";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <BrandMark size="md" />

      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 text-pink-600">
        <FiMapPin size={24} aria-hidden="true" />
      </span>

      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Página não encontrada</h1>
        <p className="max-w-sm text-sm text-gray-500">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>

      <Link
        to={homeRoute}
        className="rounded-lg bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
