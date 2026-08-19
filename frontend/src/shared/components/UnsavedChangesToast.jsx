import { FiAlertCircle } from "react-icons/fi";

export default function UnsavedChangesToast({ visible, onSave, onDismiss, isSaving }) {
  if (!visible) return null;

  return (
    <div className="animate-slide-up fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:pb-6">
      <div className="flex w-full max-w-lg items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
        <FiAlertCircle className="shrink-0 text-pink-600" size={20} aria-hidden="true" />
        <p className="flex-1 text-sm font-medium text-gray-700">Você tem alterações não salvas.</p>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
