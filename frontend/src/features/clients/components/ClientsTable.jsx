import { useState } from "react";
import { FiCalendar, FiMoreHorizontal } from "react-icons/fi";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import { clients, clientFilters } from "../data/mockClients";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function ClientsTable() {
  const [filter, setFilter] = useState("all");

  const filteredClients =
    filter === "all" ? clients : clients.filter((client) => client.segment === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Todas as clientes</h2>
        <AutocompleteFilter
          options={clientFilters}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar clientes"
          placeholder="Filtrar clientes"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              <th className="pb-3 font-semibold">Cliente</th>
              <th className="pb-3 font-semibold">Contato</th>
              <th className="pb-3 font-semibold">Visitas</th>
              <th className="pb-3 font-semibold">Gasto total</th>
              <th className="pb-3 font-semibold">Última</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td className="py-4 pr-4 align-middle">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: `linear-gradient(135deg, ${client.from}, ${client.to})` }}
                      aria-hidden="true"
                    >
                      {getInitials(client.name)}
                    </span>
                    <p className="font-semibold whitespace-nowrap text-gray-900">{client.name}</p>
                  </div>
                </td>
                <td className="py-4 pr-4 align-middle">
                  <p className="text-gray-600">{client.email}</p>
                  <p className="text-xs text-gray-400">{client.phone}</p>
                </td>
                <td className="py-4 pr-4 align-middle text-gray-600">{client.visits}</td>
                <td className="py-4 pr-4 align-middle font-semibold text-gray-900 whitespace-nowrap">
                  {client.spent}
                </td>
                <td className="py-4 pr-4 align-middle text-gray-500 whitespace-nowrap">{client.lastVisit}</td>
                <td className="py-4 align-middle text-right whitespace-nowrap">
                  <button
                    type="button"
                    aria-label="Ver agenda"
                    className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    <FiCalendar size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Mais opções"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    <FiMoreHorizontal size={14} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
