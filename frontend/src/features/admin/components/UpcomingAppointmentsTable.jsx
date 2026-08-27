import { useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import Avatar from "../../../shared/components/Avatar";
import { avatarColorFor } from "../../../shared/utils/avatarColor";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "confirmed", label: "Confirmados" },
];

const NEXT_ACTION = {
  confirmed: { status: "completed", label: "Concluir" },
};

export default function UpcomingAppointmentsTable({ appointments, onStatusChange }) {
  const [filter, setFilter] = useState("all");

  const items = filter === "all" ? appointments : appointments.filter((item) => item.status === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-gray-900">Próximos atendimentos</h2>
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
                    <Avatar name={item.client} size={36} />
                    <div>
                      <p className="font-semibold text-gray-900">{item.client}</p>
                      <p className="text-xs text-gray-500">
                        {item.dateShort} · {item.time}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
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
              <th className="pb-3 font-semibold">Horário</th>
              <th className="pb-3 font-semibold">Cliente</th>
              <th className="pb-3 font-semibold">Serviço</th>
              <th className="pb-3 font-semibold">Profissional</th>
              <th className="pb-3 font-semibold">Valor</th>
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
                        <Avatar name={item.client} size={36} />
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
                    <td className="py-4 pr-4 align-middle font-semibold text-gray-900">{item.price}</td>
                    <td className="py-4 pr-4 align-middle">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 align-middle text-right">
                      {action && (
                        <button
                          type="button"
                          onClick={() => onStatusChange(item.id, action.status)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {action.label}
                        </button>
                      )}
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
