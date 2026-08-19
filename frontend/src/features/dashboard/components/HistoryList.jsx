import { Link } from "react-router-dom";
import StatusBadge from "../../../shared/components/StatusBadge";

export default function HistoryList({
  items,
  viewAllTo = "/service-history",
  heading = "Histórico recente",
  showViewAll = true,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      {heading && (
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-gray-900">{heading}</h3>
          {showViewAll && (
            <Link to={viewAllTo} className="text-sm font-medium text-pink-600 hover:underline">
              Ver tudo
            </Link>
          )}
        </div>
      )}

      <ul className={`divide-y divide-gray-100 ${heading ? "mt-4" : ""}`}>
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <img
              src="/Mary_Cabelereira.jpeg"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{item.service}</p>
              <p className="truncate text-xs text-gray-500">com {item.professional}</p>
            </div>
            <p className="hidden text-xs text-gray-400 sm:block">{item.date}</p>
            <StatusBadge status={item.status} />
            <p className="w-16 text-right text-sm font-semibold text-gray-900">{item.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
