import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ScheduleToolbar({ dateLabel, onPrevDay, onNextDay, onToday }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevDay}
          aria-label="Dia anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <FiChevronLeft size={16} aria-hidden="true" />
        </button>
        <p className="text-sm font-semibold text-gray-900">{dateLabel}</p>
        <button
          type="button"
          onClick={onNextDay}
          aria-label="Próximo dia"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <FiChevronRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Hoje
        </button>
      </div>
    </div>
  );
}
