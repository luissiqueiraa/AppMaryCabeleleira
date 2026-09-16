import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../shared/contexts/useAuth";
import { useToast } from "../../../shared/contexts/useToast";
import { isGoogleAuthEnabled } from "../../../shared/services/firebase";
import { getErrorMessage } from "../../../shared/utils/errorMessage";
import { ROLES } from "../../../shared/constants/roles";

// Fechar o popup (ou abrir outro por cima) não é erro de verdade — a pessoa
// só desistiu, então não vale um toast vermelho.
const SILENT_ERRORS = [
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
];

export default function SocialAuthButtons() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isGoogleAuthEnabled()) return null;

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      const isStaff = [ROLES.OWNER, ROLES.ADMIN, ROLES.EMPLOYEE].includes(user.role?.name);
      navigate(isStaff ? "/admin" : "/dashboard");
    } catch (error) {
      if (!SILENT_ERRORS.includes(error?.code)) {
        toast.error(
          getErrorMessage(error, "Não foi possível entrar com o Google. Tente novamente.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-gray-200" aria-hidden="true" />
        <span className="relative bg-white px-3 text-xs text-gray-500">{t("socialDivider")}</span>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          aria-label={t("continueWith", { provider: "Google" })}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaGoogle aria-hidden="true" />
          {isLoading ? "Entrando..." : t("continueWith", { provider: "Google" })}
        </button>
      </div>
    </div>
  );
}
