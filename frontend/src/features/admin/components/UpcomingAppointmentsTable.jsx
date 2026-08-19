import { useState } from "react";
import StatusBadge from "../../../shared/components/StatusBadge";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import { avatarColorFor } from "../../../shared/utils/avatarColor";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "pending", label: "Pendentes" },
  { id: "confirmed", label: "Confirmados" },
];

const NEXT_ACTION = {
  pending: { status: "confirmed", label: "Confirmar" },
  confirmed: { status: "completed", label: "Concluir" },
};

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

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

      <div className="mt-4 overflow-x-auto">
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-gray-400">
                  Nenhum agendamento por aqui.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const action = NEXT_ACTION[item.status];
                return (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 align-middle font-medium text-gray-900 whitespace-nowrap">
                      {item.dateShort} · {item.time}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                          {getInitials(item.client)}
                        </span>
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
