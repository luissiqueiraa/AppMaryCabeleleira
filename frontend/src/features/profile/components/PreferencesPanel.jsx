import { useState } from "react";
import Switch from "../../../shared/components/Switch";
import { updatePreferences } from "../services/profileService";

export default function PreferencesPanel({ whatsappReminders, onSaved }) {
  const [enabled, setEnabled] = useState(whatsappReminders);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle(value) {
    const previous = enabled;
    setEnabled(value);
    setIsSaving(true);
    setError("");
    try {
      const { data } = await updatePreferences({ whatsappReminders: value });
      onSaved?.({ whatsappReminders: data.whatsappReminders });
    } catch {
      setEnabled(previous);
      setError("Não foi possível salvar agora. Tente novamente em instantes.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-gray-900">
        Preferências de atendimento
      </h3>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="mt-4 divide-y divide-gray-100">
        <li className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Lembretes por WhatsApp</p>
            <p className="mt-0.5 text-sm text-gray-500">Avisamos 1h antes do horário</p>
          </div>
          <Switch
            checked={enabled}
            onChange={handleToggle}
            disabled={isSaving}
            label="Lembretes por WhatsApp"
          />
        </li>
      </ul>
    </div>
  );
}
