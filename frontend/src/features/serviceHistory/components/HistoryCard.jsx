import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";
import HistoryDetails from "./HistoryDetails";

// A seta abre o atendimento ali mesmo, sem tirar a cliente da lista. Antes era
// só um ícone decorativo, que prometia abrir algo e não abria.
export default function HistoryCard({ item }) {
  const [open, setOpen] = useState(false);
  const detailsId = `historico-${item.id}`;

  return (
    <li className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <img
          src="/Mary_Cabelereira.png"
          alt=""
          aria-hidden="true"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display truncate text-base font-semibold text-gray-900">
              {item.service}
            </p>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-500">com {item.professional}</p>
          <p className="mt-0.5 text-sm text-gray-400">
            {item.date}
            {item.time && `, ${item.time}`}
          </p>
        </div>
        <FiChevronDown
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div id={detailsId} className="border-t border-gray-100 p-4">
          <HistoryDetails item={item} />
        </div>
      )}
    </li>
  );
}
