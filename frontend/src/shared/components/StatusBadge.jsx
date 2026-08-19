const STATUS_MAP = {
  pending: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmado", className: "bg-emerald-50 text-emerald-700" },
  completed: { label: "Finalizado", className: "bg-purple-50 text-purple-700" },
  cancelled: { label: "Cancelado", className: "bg-red-50 text-red-600" },
  active: { label: "Ativo", className: "bg-emerald-50 text-emerald-700" },
  paused: { label: "Pausado", className: "bg-gray-100 text-gray-500" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending;

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${config.className}`}
    >
      {config.label}
    </span>
  );
}
