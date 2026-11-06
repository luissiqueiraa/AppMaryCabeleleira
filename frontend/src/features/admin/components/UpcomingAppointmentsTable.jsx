import { useState } from "react";
import { FiTrash2, FiSlash, FiCalendar } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import OverflowMenu from "../../../shared/components/OverflowMenu";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import Avatar from "../../../shared/components/Avatar";
import { avatarColorFor } from "../../../shared/utils/avatarColor";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "confirmed", label: "Confirmados" },
];

// Agendamento pendente (dado legado) precisa de uma saída na tela: confirmar
// primeiro, concluir depois.
const NEXT_ACTION = {
  pending: { status: "confirmed", label: "Confirmar" },
  confirmed: { status: "completed", label: "Concluir" },
};

export default function UpcomingAppointmentsTable({
  appointments,
  onStatusChange,
  onRequestDelete,
  onRequestCancel,
  onRequestReschedule,
}) {
  const [filter, setFilter] = useState("all");

  // Cancelar é o caminho normal quando a cliente desmarca; excluir é para erro
  // de lançamento e só aparece para quem pode. A página decide o que passa.
  const rowMenu = (item) => {
    const podeCancelar = onRequestCancel && ["pending", "confirmed"].includes(item.status);
    const podeRemarcar = onRequestReschedule && ["pending", "confirmed"].includes(item.status);
    const actions = [
      ...(podeRemarcar
        ? [{ label: "Alterar data e horário", icon: FiCalendar, onClick: () => onRequestReschedule(item) }]
        : []),
      ...(podeCancelar
        ? [{ label: "Cancelar agendamento", icon: FiSlash, onClick: () => onRequestCancel(item) }]
        : []),
      ...(onRequestDelete
        ? [{ label: "Excluir", icon: FiTrash2, onClick: () => onRequestDelete(item), danger: true }]
        : []),
    ];

    if (actions.length === 0) return null;

    return (
      <OverflowMenu
        ariaLabel={`Mais opções do agendamento de ${item.client}`}
        actions={actions}
      />
    );
  };

  const items = filter === "all" ? appointments : appointments.filter((item) => item.status === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold whitespace-nowrap text-gray-900">
          Próximos atendimentos
        </h2>
        <AutocompleteFilter
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar próximos atendimentos"
          placeholder="Filtrar"
        />
      </div>

      {items.length === 0 && (
        <p className="mt-4 py-8 text-center text-sm text-gray-400">Nenhum agendamento por aqui.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 space-y-3 lg:hidden">
          {items.map((item) => {
            const action = NEXT_ACTION[item.status];
            return (
              <li key={item.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.client} avatarUrl={item.clientAvatarUrl} size={36} />
                    <div>
                      <p className="font-semibold text-gray-900">{item.client}</p>
                      <p className="text-xs text-gray-500">
                        {item.dateShort} · {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusBadge status={item.status} />
                    {rowMenu(item)}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-gray-600">{item.service}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: avatarColorFor(item.employeeId ?? item.id).to }}
                        aria-hidden="true"
                      />
                      {item.professional}
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold text-gray-900">{item.price}</p>
                </div>

                {action && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(item.id, action.status)}
                    className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {action.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {items.length > 0 && (
      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              {/* O valor é o dado menos urgente numa lista do que ainda vai
                  acontecer — entra a partir de xl, onde há largura sobrando. */}
              <th className="pb-3 font-semibold">Horário</th>
              <th className="pb-3 font-semibold">Cliente</th>
              <th className="pb-3 font-semibold">Serviço</th>
              <th className="pb-3 font-semibold">Profissional</th>
              <th className="hidden pb-3 font-semibold xl:table-cell">Valor</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
                const action = NEXT_ACTION[item.status];
                return (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 align-middle font-medium text-gray-900 whitespace-nowrap">
                      {item.dateShort} · {item.time}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.client} avatarUrl={item.clientAvatarUrl} size={36} />
                        <div>
                          <p className="font-semibold text-gray-900">{item.client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle text-gray-600">{item.service}</td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: avatarColorFor(item.employeeId ?? item.id).to }}
                          aria-hidden="true"
                        />
                        {item.professional}
                      </div>
                    </td>
                    <td className="hidden py-4 pr-4 align-middle font-semibold text-gray-900 xl:table-cell">
                      {item.price}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 align-middle">
                      <div className="flex items-center justify-end gap-1">
                      {action && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item.id, action.status)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {action.label}
                        </button>
                      )}
                      {rowMenu(item)}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
