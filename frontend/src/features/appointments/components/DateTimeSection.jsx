import { useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getAvailableDays } from "../data/mockAvailability";

const PERIODS = [
  { id: "morning", label: "Manhã", isInPeriod: (time) => Number(time.split(":")[0]) < 12 },
  { id: "afternoon", label: "Tarde", isInPeriod: (time) => Number(time.split(":")[0]) >= 12 && Number(time.split(":")[0]) < 18 },
  { id: "evening", label: "Noite", isInPeriod: (time) => Number(time.split(":")[0]) >= 18 },
];

export default function DateTimeSection({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  heading,
  slots = [],
  unavailableTimes = new Set(),
  isLoadingAvailability = false,
}) {
  const days = useMemo(() => getAvailableDays(), []);
  const activeDay = days.find((day) => day.iso === selectedDate);
  const monthLabel = activeDay?.monthLabel ?? days[0]?.monthLabel;

  const groupedSlots = PERIODS.map((period) => ({
    ...period,
    slots: slots
      .filter((time) => period.isInPeriod(time))
      .map((time) => ({ time, available: !unavailableTimes.has(time) })),
  })).filter((period) => period.slots.length > 0);

  return (
    <section aria-labelledby="datetime-section-title">
      <div className="flex items-center justify-between">
        <h2 id="datetime-section-title" className="font-display text-lg font-semibold text-gray-900">
          {heading ?? monthLabel}
        </h2>
        {heading ? (
          <p className="text-sm text-gray-400">{monthLabel}</p>
        ) : (
          <div className="hidden gap-2 lg:flex">
            <button
              type="button"
              aria-label="Mês anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <FiChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Próximo mês"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              <FiChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div role="radiogroup" aria-label="Data" className="mt-4 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = day.iso === selectedDate;
          return (
            <button
              key={day.iso}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={day.disabled}
              onClick={() => onSelectDate(day.iso)}
              className="flex flex-col items-center gap-1.5"
            >
              <span className={`text-xs font-medium ${isSelected ? "text-pink-600" : "text-gray-400"}`}>
                {day.weekday}
              </span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-pink-600 text-white"
                    : day.disabled
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day.day}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Horários disponíveis</h3>
        {activeDay && (
          <p className="text-xs text-gray-400">
            {activeDay.weekday}, {activeDay.day}
          </p>
        )}
      </div>

      {isLoadingAvailability && <p className="mt-3 text-xs text-gray-400">Verificando disponibilidade...</p>}

      <div className="mt-4 space-y-5">
        {groupedSlots.map((period) => (
          <div key={period.id}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">{period.label}</span>
              <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                {period.slots.length} {period.slots.length === 1 ? "horário" : "horários"}
              </span>
            </div>

            <div role="radiogroup" aria-label={`Horários da ${period.label.toLowerCase()}`} className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {period.slots.map((slot) => {
                const isSelected = slot.time === selectedTime;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={!slot.available}
                    onClick={() => onSelectTime(slot.time)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-pink-600 bg-pink-600 text-white"
                        : slot.available
                          ? "border-gray-200 text-gray-700 hover:border-gray-300"
                          : "cursor-not-allowed border-gray-100 text-gray-300 line-through"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
