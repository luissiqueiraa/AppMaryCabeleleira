import { useEffect, useState } from "react";
import SalonIdentityCard from "../components/SalonIdentityCard";
import BusinessHoursCard from "../components/BusinessHoursCard";
import DangerZoneCard from "../components/DangerZoneCard";
import UnsavedChangesToast from "../../../shared/components/UnsavedChangesToast";
import { getSettings, updateSettings, uploadSalonLogo } from "../../../shared/services/settingsService";
import { settingsTabs } from "../data/mockAdminSettings";
import { useToast } from "../../../shared/contexts/useToast";
import { useAuth } from "../../../shared/contexts/useAuth";
import { ROLES } from "../../../shared/constants/roles";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

const PLACEHOLDER_TABS = settingsTabs.filter((tab) => tab.id !== "salao" && tab.id !== "hours");

export default function AdminSettingsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    getSettings()
      .then(({ data }) => {
        setSettings(data);
        setDraft(data);
        setLoadStatus("success");
      })
      .catch(() => setLoadStatus("error"));
  }, []);

  const dirty = settings && draft ? JSON.stringify(settings) !== JSON.stringify(draft) : false;

  function updateDraft(patch) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function updateHours(hours) {
    setDraft((prev) => ({ ...prev, hours }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const { data } = await updateSettings({
        name: draft.name,
        address: draft.address,
        phone: draft.phone,
        email: draft.email,
        hours: draft.hours,
      });
      setSettings(data);
      setDraft(data);
      toast.success("Configurações salvas com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível salvar agora. Tente novamente em instantes."));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setDraft(settings);
  }

  async function handleLogoChange(file) {
    setIsUploadingLogo(true);
    try {
      const { data } = await uploadSalonLogo(file);
      setSettings(data);
      setDraft(data);
      toast.success("Logo atualizada com sucesso.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Não foi possível atualizar a logo agora. Tente novamente."));
    } finally {
      setIsUploadingLogo(false);
    }
  }

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error" || !draft) {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar as configurações agora. Tente novamente em instantes.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <SalonIdentityCard
        values={draft}
        onChange={updateDraft}
        onLogoChange={handleLogoChange}
        isUploadingLogo={isUploadingLogo}
      />
      <BusinessHoursCard hours={draft.hours} onChange={updateHours} />

      {/* Admin e proprietária. Funcionária não chega nesta página, mas o card
          fica fora do alcance dela de qualquer forma. */}
      {[ROLES.OWNER, ROLES.ADMIN].includes(user?.role?.name) && (
        <DangerZoneCard
          onReset={(defaults) => {
            setSettings(defaults);
            setDraft(defaults);
          }}
        />
      )}

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
        onDismiss={handleDiscard}
      />
    </div>
  );
}
