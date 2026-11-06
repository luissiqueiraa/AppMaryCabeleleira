import { FiCheck, FiClock } from "react-icons/fi";
import { formatBRL } from "../../../shared/utils/formatCurrency";

export default function ServiceList({ services, isLoading, selectedIds = [], onToggle }) {
  return (
    <section aria-labelledby="service-section-title">
      <h2 id="service-section-title" className="font-display text-lg font-semibold text-gray-900">
        Selecione os serviços
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Você pode escolher mais de um procedimento para o mesmo horário.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Carregando serviços...</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const isSelected = selectedIds.includes(service.id);
            return (
              <li key={service.id}>
                <button
                  type="button"
                  onClick={() => onToggle(service)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-4 rounded-lg border bg-white p-4 text-left shadow-sm transition-colors ${
                    isSelected ? "border-pink-500 ring-1 ring-pink-200" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src="/Mary_Cabelereira.png"
                    alt=""
                    aria-hidden="true"
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-semibold text-gray-900">
                      {service.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                      <FiClock aria-hidden="true" />
                      {service.duration} min · {formatBRL(service.price)}
                    </span>
                  </span>
                  {/* Quadrado (e não círculo) porque a escolha é múltipla:
                      a forma já avisa que dá pra marcar vários. */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                      isSelected ? "border-pink-600 bg-pink-600 text-white" : "border-gray-300"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <FiCheck size={14} />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
