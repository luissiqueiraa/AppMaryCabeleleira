import { useState } from "react";
import { FiEdit2, FiMoreHorizontal } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import { services, serviceFilters } from "../data/mockAdminServices";

export default function ServicesTable() {
  const [filter, setFilter] = useState("all");

  const filteredServices =
    filter === "all" ? services : services.filter((service) => service.category === filter);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Todos os serviços</h2>
        <AutocompleteFilter
          options={serviceFilters}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar serviços"
          placeholder="Filtrar serviços"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              <th className="pb-3 font-semibold">Serviço</th>
              <th className="pb-3 font-semibold">Categoria</th>
              <th className="pb-3 font-semibold">Duração</th>
              <th className="pb-3 font-semibold">Preço</th>
              <th className="pb-3 font-semibold">Agendamentos</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredServices.map((service) => {
              const isPaused = service.status === "paused";
              return (
                <tr key={service.id}>
                  <td className="py-4 pr-4 align-middle">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-9 w-9 shrink-0 rounded-full"
                        style={{ background: `linear-gradient(135deg, ${service.from}, ${service.to})` }}
                        aria-hidden="true"
                      />
                      <p className={`font-semibold whitespace-nowrap ${isPaused ? "text-gray-400" : "text-gray-900"}`}>
                        {service.name}
                      </p>
                    </div>
                  </td>
                  <td className={`py-4 pr-4 align-middle whitespace-nowrap ${isPaused ? "text-gray-400" : "text-gray-600"}`}>
                    {service.categoryLabel}
                  </td>
                  <td className={`py-4 pr-4 align-middle whitespace-nowrap ${isPaused ? "text-gray-400" : "text-gray-600"}`}>
                    {service.duration}
                  </td>
                  <td className={`py-4 pr-4 align-middle font-semibold whitespace-nowrap ${isPaused ? "text-gray-400" : "text-gray-900"}`}>
                    {service.price}
                  </td>
                  <td className="py-4 pr-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-gray-100">
                        <div
                          className={`h-1.5 rounded-full ${isPaused ? "bg-gray-300" : "bg-gradient-to-r from-pink-500 to-pink-600"}`}
                          style={{ width: `${service.percent}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <span className={`text-xs ${isPaused ? "text-gray-400" : "text-gray-500"}`}>
                        {service.appointments}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 align-middle">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="py-4 align-middle text-right whitespace-nowrap">
                    <button
                      type="button"
                      aria-label="Editar serviço"
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50"
                    >
                      <FiEdit2 size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="rounded-full p-1.5 text-gray-400 hover:bg-gray-50"
                    >
                      <FiMoreHorizontal size={14} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
