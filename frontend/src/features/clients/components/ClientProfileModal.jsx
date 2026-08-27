import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import AppointmentHistoryList from "../../../shared/components/AppointmentHistoryList";
import Avatar from "../../../shared/components/Avatar";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { formatRelativeDate } from "../../../shared/utils/formatDate";

const SEGMENT_LABEL = { recent: "Recente", inactive: "Inativa" };

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3 text-center">
      <p className="font-display text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function ClientProfileModal({ client, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-profile-title"
        tabIndex={-1}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl outline-none"
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <Avatar name={client.name} avatarUrl={client.avatarUrl} size={48} />
            <div>
              <h2 id="client-profile-title" className="font-display text-lg font-semibold text-gray-900">
                {client.name}
              </h2>
              <p className="text-xs text-gray-500">{client.email}</p>
              <p className="text-xs text-gray-500">{client.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Visitas" value={client.visits} />
            <Stat label="Gasto total" value={formatBRL(client.spent)} />
            <Stat label="Última visita" value={formatRelativeDate(client.lastVisit)} />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            Segmento: {SEGMENT_LABEL[client.segment] ?? client.segment}
          </p>

          <h3 className="mt-6 text-sm font-semibold text-gray-900">Histórico de agendamentos</h3>
          <div className="mt-2">
            <AppointmentHistoryList clientId={client.id} emptyLabel="Essa cliente ainda não tem agendamentos." />
          </div>
        </div>
      </div>
    </div>
  );
}
