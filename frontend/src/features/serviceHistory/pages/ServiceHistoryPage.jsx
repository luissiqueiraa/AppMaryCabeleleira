import { useEffect, useState } from "react";
import AutocompleteFilter from "../../../shared/components/AutocompleteFilter";
import HistoryCard from "../components/HistoryCard";
import HistoryTable from "../components/HistoryTable";
import { listAppointments } from "../../dashboard/services/appointmentService";
import { mapAppointment } from "../../../shared/utils/mapAppointment";
import { historyFilters } from "../data/mockHistory";
import { useAuth } from "../../../shared/contexts/useAuth";

export default function ServiceHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    listAppointments({ clientId: user.id })
      .then(({ data }) => {
        if (!isMounted) return;
        setHistory(
          data.map(mapAppointment).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
        );
        setLoadStatus("success");
      })
      .catch(() => {
        if (isMounted) setLoadStatus("error");
      });
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  const filteredHistory =
    filter === "all"
      ? history
      : history.filter((item) => {
          const ageMs = new Date() - new Date(item.scheduledAt);
          return ageMs >= 0 && ageMs <= Number(filter) * 24 * 60 * 60 * 1000;
        });

  if (loadStatus === "loading") {
    return <p className="text-sm text-gray-500">Carregando...</p>;
  }

  if (loadStatus === "error") {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Não foi possível carregar seu histórico agora. Tente novamente em instantes.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl space-y-4 lg:hidden">
        <AutocompleteFilter
          options={historyFilters}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filtrar histórico por período"
          placeholder="Filtrar histórico"
        />

        {filteredHistory.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Nenhum atendimento encontrado para esse período.
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredHistory.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      <div className="hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 lg:block">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">Todos os atendimentos</h2>
          <AutocompleteFilter
            options={historyFilters}
            value={filter}
            onChange={setFilter}
            ariaLabel="Filtrar histórico por período"
            placeholder="Filtrar histórico"
          />
        </div>

        {filteredHistory.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            Nenhum atendimento encontrado para esse período.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <HistoryTable items={filteredHistory} />
          </div>
        )}
      </div>
    </div>
  );
}
