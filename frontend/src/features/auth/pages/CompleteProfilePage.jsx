import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { useAuth } from "../../../shared/contexts/useAuth";
import { updatePhoneNumber } from "../../profile/services/profileService";
import { maskBrazilianPhone } from "../../../shared/utils/phoneMask";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

// Mesma regra do cadastro por email/senha: DDD + 8 ou 9 dígitos.
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;

// Entrar com o Google traz nome, email e foto, mas nunca o telefone — e o salão
// precisa dele para confirmar horário. Esta tela é o passo que fecha esse buraco
// logo depois do primeiro login; o PrivateRoute traz a pessoa de volta pra cá
// enquanto o número não estiver preenchido.
export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const firstName = user?.fullName?.trim().split(" ")[0];

  async function handleSubmit(event) {
    event.preventDefault();
    const digits = phoneNumber.replace(/\D/g, "");

    if (!digits) {
      setError("Informe seu telefone.");
      return;
    }
    if (!PHONE_DIGITS_PATTERN.test(digits)) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const { data } = await updatePhoneNumber({ phoneNumber: digits });
      updateUser({ phoneNumber: data.phoneNumber });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível salvar seu telefone agora. Tente novamente."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold text-gray-900">
          {firstName ? `Quase lá, ${firstName}!` : "Quase lá!"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Falta só o seu telefone. É por ele que confirmamos o seu horário e avisamos sobre
          qualquer mudança no agendamento.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <FormField
            id="phoneNumber"
            name="phoneNumber"
            label="Telefone"
            type="tel"
            icon={FiPhone}
            inputProps={{
              autoComplete: "tel",
              autoFocus: true,
              maxLength: 15,
              value: phoneNumber,
              onChange: (event) => setPhoneNumber(maskBrazilianPhone(event.target.value)),
              placeholder: "Digite seu telefone",
            }}
          />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Salvando..." : "Continuar"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
