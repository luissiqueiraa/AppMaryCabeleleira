import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiCheck, FiPhone } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { profile } from "../data/mockProfile";
import { updatePhoneNumber } from "../services/profileService";

export default function PhonePage() {
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("saving");
    setError("");
    try {
      await updatePhoneNumber({ phoneNumber });
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
        className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Telefone</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <FiCheck size={12} aria-hidden="true" />
            Verificado
          </span>
        </div>

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
          inputProps={{ value: phoneNumber, onChange: (event) => setPhoneNumber(event.target.value) }}
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
