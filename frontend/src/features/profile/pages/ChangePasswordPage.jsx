import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import PasswordInput from "../../auth/components/PasswordInput";
import { changePassword } from "../services/profileService";

const INITIAL_VALUES = { currentPassword: "", newPassword: "", confirmNewPassword: "" };

export default function ChangePasswordPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (values.newPassword !== values.confirmNewPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setStatus("saving");
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setStatus("saved");
      setValues(INITIAL_VALUES);
    } catch {
      setStatus("error");
      setError("Não foi possível alterar sua senha agora. Tente novamente em instantes.");
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
        <h2 className="font-display text-lg font-semibold text-gray-900">Alterar senha</h2>

        {status === "saved" && (
          <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Senha alterada com sucesso.
          </p>
        )}
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <PasswordInput
          id="currentPassword"
          name="currentPassword"
          label="Senha atual"
          inputProps={{
            autoComplete: "current-password",
            value: values.currentPassword,
            onChange: handleChange,
          }}
        />
        <PasswordInput
          id="newPassword"
          name="newPassword"
          label="Nova senha"
          inputProps={{
            autoComplete: "new-password",
            value: values.newPassword,
            onChange: handleChange,
          }}
        />
        <PasswordInput
          id="confirmNewPassword"
          name="confirmNewPassword"
          label="Confirmar nova senha"
          inputProps={{
            autoComplete: "new-password",
            value: values.confirmNewPassword,
            onChange: handleChange,
          }}
        />

        <button
          type="submit"
          disabled={status === "saving"}
          className="w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
