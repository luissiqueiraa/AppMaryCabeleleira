import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiPhone } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { useAuth } from "../../../shared/contexts/useAuth";
import { updatePhoneNumber } from "../services/profileService";
import { maskBrazilianPhone } from "../../../shared/utils/phoneMask";

export default function PhonePage() {
  const { user, updateUser } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState(maskBrazilianPhone(user.phoneNumber ?? ""));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const digitsOnlyPhone = phoneNumber.replace(/\D/g, "") || undefined;
      const { data } = await updatePhoneNumber({ phoneNumber: digitsOnlyPhone });
      updateUser({ phoneNumber: data.phoneNumber });
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("Não foi possível atualizar seu telefone agora. Tente novamente em instantes.");
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700">
        <FiChevronLeft aria-hidden="true" />
        Voltar ao perfil
      </Link>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
      >
        <h2 className="font-display text-lg font-semibold text-gray-900">Telefone</h2>

        {status === "saved" && (
          <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Telefone atualizado com sucesso.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <FormField
          id="phoneNumber"
          name="phoneNumber"
          label="Número de telefone"
          type="tel"
          icon={FiPhone}
          inputProps={{ value: phoneNumber, onChange: (event) => setPhoneNumber(maskBrazilianPhone(event.target.value)) }}
        />

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Salvando..." : "Salvar telefone"}
        </button>
      </form>
    </div>
  );
}
