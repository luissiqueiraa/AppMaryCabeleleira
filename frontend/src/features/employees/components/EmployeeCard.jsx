import { FiCalendar, FiEdit2, FiMoreHorizontal } from "react-icons/fi";

const STATUS_LABEL = {
  available: "Disponível hoje",
  off: "Folga",
};

export default function EmployeeCard({ employee }) {
  const isAvailable = employee.status === "available";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span
          className="h-14 w-14 shrink-0 rounded-full"
          style={{ background: `linear-gradient(135deg, ${employee.from}, ${employee.to})` }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-display font-semibold text-gray-900">{employee.name}</p>
            <span
              className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
                isAvailable ? "text-green-600" : "text-gray-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}
                aria-hidden="true"
              />
              {STATUS_LABEL[employee.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500">{employee.role}</p>
          <p className="mt-1 text-sm text-gray-600">{employee.appointments} atendimentos</p>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {employee.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-600">
            {tag}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">
          Na equipe desde <span className="font-semibold text-gray-700">{employee.since}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Ver agenda"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <FiCalendar size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Editar"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <FiEdit2 size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Mais opções"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <FiMoreHorizontal size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
