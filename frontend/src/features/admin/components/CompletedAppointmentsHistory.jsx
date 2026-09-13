import { useEffect, useState } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Avatar from "../../../shared/components/Avatar";
import { listAppointments } from "../../dashboard/services/appointmentService";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { formatDateOnly, formatTime } from "../../../shared/utils/formatDate";

const PAGE_SIZE = 10;

export default function CompletedAppointmentsHistory() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      setLoadStatus("loading");
      listAppointments({
        status: "completed",
        page,
        limit: PAGE_SIZE,
        order: "desc",
        search: search.trim() || undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      })
        .then(({ data, pagination: meta }) => {
          if (!isMounted) return;
          setItems(data);
          setPagination(meta);
          setLoadStatus("success");
        })
        .catch(() => {
          if (isMounted) setLoadStatus("error");
        });
    }, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [search, dateFrom, dateTo, page]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-gray-900">Atendimentos realizados</h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              size={14}
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente ou serviço..."
              className="w-44 rounded-lg border border-gray-200 py-2 pr-3 pl-8 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 sm:w-56"
            />
          </div>
          <input
            type="date"
            aria-label="De"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 py-2 px-2.5 text-sm text-gray-700 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
          />
          <span className="text-sm text-gray-400">até</span>
          <input
            type="date"
            aria-label="Até"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 py-2 px-2.5 text-sm text-gray-700 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
          />
        </div>
      </div>

      {loadStatus === "loading" && <p className="mt-4 text-sm text-gray-500">Carregando...</p>}

      {loadStatus === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os atendimentos agora. Tente novamente em instantes.
        </p>
      )}

      {loadStatus === "success" && items.length === 0 && (
        <p className="mt-4 rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          Nenhum atendimento encontrado para esse filtro.
        </p>
      )}

      {loadStatus === "success" && items.length > 0 && (
        <>
          <ul className="mt-4 space-y-3 lg:hidden">
            {items.map((item) => (
              <li key={item.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={item.client.fullName} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{item.client.fullName}</p>
                    <p className="truncate text-xs text-gray-500">
                      {formatDateOnly(item.scheduledAt)} · {formatTime(item.scheduledAt)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900">{formatBRL(item.price)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{item.service.name}</span>
                  <span className="shrink-0">{item.employee?.fullName ?? "Sem profissional"}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  <th className="pb-3 font-semibold">Data</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Serviço</th>
                  <th className="pb-3 font-semibold">Profissional</th>
                  <th className="pb-3 font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4 align-middle whitespace-nowrap text-gray-600">
                      {formatDateOnly(item.scheduledAt)} · {formatTime(item.scheduledAt)}
                    </td>
                    <td className="py-4 pr-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar name={item.client.fullName} size={32} />
                        <p className="font-semibold whitespace-nowrap text-gray-900">{item.client.fullName}</p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 align-middle text-gray-600">{item.service.name}</td>
                    <td className="py-4 pr-4 align-middle text-gray-600">{item.employee?.fullName ?? "Sem profissional"}</td>
                    <td className="py-4 pr-4 align-middle font-semibold whitespace-nowrap text-gray-900">
                      {formatBRL(item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Página {pagination.page} de {pagination.totalPages} · {pagination.total} atendimentos
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                  aria-label="Página anterior"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  aria-label="Próxima página"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
