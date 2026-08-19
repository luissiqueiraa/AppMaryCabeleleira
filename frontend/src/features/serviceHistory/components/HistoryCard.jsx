import StatusBadge from "../../../shared/components/StatusBadge";

export default function HistoryCard({ item }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <img
        src="/Mary_Cabelereira.jpeg"
        alt=""
        aria-hidden="true"
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-display text-base font-semibold text-gray-900">
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
    </li>
  );
}
