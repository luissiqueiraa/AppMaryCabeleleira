import { useState } from "react";
import SalonIdentityCard from "../components/SalonIdentityCard";
import BusinessHoursCard from "../components/BusinessHoursCard";
import UnsavedChangesToast from "../../../shared/components/UnsavedChangesToast";
import { settingsTabs } from "../data/mockAdminSettings";

const PLACEHOLDER_TABS = settingsTabs.filter((tab) => tab.id !== "salao" && tab.id !== "hours");

export default function AdminSettingsPage() {
  const [dirty, setDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setDirty(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <SalonIdentityCard onDirty={() => setDirty(true)} />
      <BusinessHoursCard onDirty={() => setDirty(true)} />

      {PLACEHOLDER_TABS.map((tab) => (
        <p
          key={tab.id}
          className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500"
        >
          {tab.label} em breve.
        </p>
      ))}

      <UnsavedChangesToast
        visible={dirty}
        isSaving={isSaving}
        onSave={handleSave}
        onDismiss={() => setDirty(false)}
      />
    </div>
  );
}
