import { Link } from "react-router-dom";
import { FiCalendar, FiClock } from "react-icons/fi";
import StatusBadge from "../../../shared/components/StatusBadge";

export default function AppointmentCard({ appointment, onCancel }) {
  const canManage = appointment.status === "pending" || appointment.status === "confirmed";

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-900">
            {appointment.service}
          </h3>
          <p className="text-sm text-gray-500">com {appointment.professional}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5">
          <FiCalendar aria-hidden="true" />
          {appointment.date}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5">
          <FiClock aria-hidden="true" />
          {appointment.time}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={`/appointments/${appointment.id}`}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ver detalhes
        </Link>
        {canManage && (
          <>
            <Link
              to={`/appointments/${appointment.id}/reschedule`}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Remarcar
            </Link>
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
