import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import SystemResetModal from "./SystemResetModal";
import { resetSystem } from "../../../shared/services/settingsService";
import { useToast } from "../../../shared/contexts/useToast";
import { getErrorMessage } from "../../../shared/utils/errorMessage";

const APAGADO = [
  "Todos os agendamentos e o histórico de atendimentos",
  "Todos os serviços do catálogo",
  "Todas as clientes e funcionárias cadastradas",
  "Notificações e registros de auditoria",
];

const MANTIDO = [
  "Sua conta e a conta da proprietária, com o mesmo email e senha",
  "Os dados do salão e o horário de funcionamento, de volta ao padrão",
  "As funções e permissões padrão do sistema",
];

export default function DangerZoneCard({ onReset }) {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm({ confirmation, password }) {
    setIsResetting(true);
    setError("");
    try {
      const { data } = await resetSystem({ confirmation, password });
      setModalOpen(false);
      toast.success(
        `Sistema restaurado: ${data.removed.appointments} agendamentos e ${data.removed.users} contas apagados.`
      );
      onReset?.(data.settings);
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível restaurar o sistema agora. Tente novamente."));
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <section
      aria-labelledby="danger-zone-title"
      className="rounded-lg border border-red-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
          <FiAlertTriangle aria-hidden="true" />
        </span>
        <div>
          <h2 id="danger-zone-title" className="font-display text-lg font-semibold text-gray-900">
            Zona de perigo
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Apaga todos os dados do sistema e devolve tudo ao estado inicial. Não há como desfazer,
            e não existe backup automático.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-red-100 bg-red-50/60 p-4">
          <h3 className="text-sm font-semibold text-red-700">Será apagado</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-red-700/90">
            {APAGADO.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Será mantido</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
            {MANTIDO.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && !modalOpen && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => {
          setError("");
          setModalOpen(true);
        }}
        className="mt-5 w-full rounded-lg border border-red-600 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:w-auto sm:px-6"
      >
        Apagar tudo e restaurar o padrão
      </button>

      {modalOpen && (
        <SystemResetModal
          isLoading={isResetting}
          error={error}
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
