import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import HistoryDetails from "./HistoryDetails";

export default function HistoryTable({ items }) {
  // Mais de um atendimento pode ficar aberto ao mesmo tempo: comparar dois
  // serviços passados é justamente o que se faz num histórico.
  const [openIds, setOpenIds] = useState(() => new Set());

  function toggle(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          <th className="pb-3 font-semibold">Data</th>
          <th className="pb-3 font-semibold">Serviço</th>
          <th className="pb-3 font-semibold">Profissional</th>
          <th className="pb-3 font-semibold">Valor</th>
          <th className="pb-3 font-semibold">Status</th>
          <th className="pb-3">
            <span className="sr-only">Detalhes</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.map((item) => {
          const open = openIds.has(item.id);
          const detailsId = `historico-linha-${item.id}`;

          return [
            <tr
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${open ? "bg-gray-50" : ""}`}
            >
              <td className="py-4 pr-4 align-middle whitespace-nowrap">
                <p className="font-medium text-gray-900">{item.date}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </td>
              <td className="py-4 pr-4 align-middle">
                <div className="flex items-center gap-3">
                  <img
                    src="/Mary_Cabelereira.png"
                    alt=""
                    aria-hidden="true"
                    className="h-9 w-9 shrink-0 rounded-lg object-cover"
                  />
                  <p className="font-semibold text-gray-900">{item.service}</p>
                </div>
              </td>
              <td className="py-4 pr-4 align-middle text-gray-600">{item.professional}</td>
              <td className="py-4 pr-4 align-middle font-semibold text-gray-900">{item.price}</td>
              <td className="py-4 pr-4 align-middle">
                <StatusBadge status={item.status} />
              </td>
              <td className="py-4 text-right align-middle">
                {/* O botão existe para quem navega por teclado: a linha inteira
                    é clicável, mas linha de tabela não recebe foco. */}
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={detailsId}
                  aria-label={`${open ? "Fechar" : "Ver"} detalhes de ${item.service}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <FiChevronDown
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </td>
            </tr>,

            open && (
              <tr key={`${item.id}-detalhes`} id={detailsId} className="bg-gray-50">
                <td colSpan={6} className="px-4 pt-0 pb-5">
                  <div className="max-w-2xl">
                    <HistoryDetails item={item} />
                  </div>
                </td>
              </tr>
            ),
          ];
        })}
      </tbody>
    </table>
  );
}
