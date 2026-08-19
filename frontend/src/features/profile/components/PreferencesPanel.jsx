import { useState } from "react";
import Switch from "../../../shared/components/Switch";
import { preferenceToggles } from "../data/mockPreferences";

export default function PreferencesPanel() {
  const [toggles, setToggles] = useState(preferenceToggles);

  function handleToggle(id, enabled) {
    setToggles((prev) => prev.map((item) => (item.id === id ? { ...item, enabled } : item)));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-display text-lg font-semibold text-gray-900">
        Preferências de atendimento
      </h3>

      <ul className="mt-4 divide-y divide-gray-100">
        {toggles.map((toggle) => (
          <li key={toggle.id} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{toggle.label}</p>
              <p className="mt-0.5 text-sm text-gray-500">{toggle.description}</p>
            </div>
            <Switch
              checked={toggle.enabled}
              onChange={(value) => handleToggle(toggle.id, value)}
              label={toggle.label}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
