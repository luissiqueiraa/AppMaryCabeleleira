import { useState } from "react";
import { FiUser, FiPhone, FiMail } from "react-icons/fi";
import FormField from "../../../shared/components/FormField";
import { updateProfile } from "../services/profileService";

export default function PersonalInfoForm({ profile }) {
  const [values, setValues] = useState({
    name: profile.name,
    phoneNumber: profile.phoneNumber,
    email: profile.email,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setStatus("saving");
    setError("");
    try {
      await updateProfile(values);
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("Não foi possível salvar agora. Tente novamente em instantes.");
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-gray-900">Dados pessoais</h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={status === "saving"}
          className="text-sm font-semibold text-pink-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {status === "saved" && (
        <p role="status" className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Dados atualizados com sucesso.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FormField
          id="name"
          name="name"
          label="Nome completo"
          icon={FiUser}
          inputProps={{ value: values.name, onChange: handleChange }}
        />
        <FormField
          id="phoneNumber"
          name="phoneNumber"
          label="Telefone"
          type="tel"
          icon={FiPhone}
          inputProps={{ value: values.phoneNumber, onChange: handleChange }}
        />
        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          icon={FiMail}
          inputProps={{ value: values.email, onChange: handleChange }}
        />
      </div>
    </div>
  );
}
