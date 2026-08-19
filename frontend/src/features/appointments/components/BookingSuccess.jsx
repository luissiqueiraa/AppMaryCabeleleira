import { Link } from "react-router-dom";
import { FiCheck, FiBell } from "react-icons/fi";

export default function BookingSuccess({ professionalName, dateLabel, time }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-600 text-white shadow-lg shadow-pink-600/30">
        <FiCheck size={28} aria-hidden="true" />
      </span>

      <h1 className="font-display mt-6 text-2xl font-semibold text-gray-900">Tudo certo!</h1>
      <p className="mt-2 text-sm text-gray-500">
        Seu horário {professionalName && <>com <strong className="text-gray-700">{professionalName}</strong> </>}
        foi confirmado para <strong className="text-gray-700">{dateLabel} às {time}</strong>.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm">
        <FiBell className="mt-0.5 shrink-0 text-pink-500" aria-hidden="true" />
        <p className="text-sm text-gray-500">
          Avisaremos 1h antes do horário. Você pode reagendar até 4h antes.
        </p>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-full bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pink-700"
      >
        Adicionar ao calendário
      </button>

      <Link to="/dashboard" className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700">
        Voltar para o início
      </Link>
    </div>
  );
}
