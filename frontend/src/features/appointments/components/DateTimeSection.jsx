import { useMemo } from "react";
import { getAvailableDays } from "../data/mockAvailability";

function toSlots(times, unavailableTimes) {
  return times.map((time) => ({ time, available: !unavailableTimes.has(time) }));
}

export default function DateTimeSection({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  heading,
  hours = [],
  slots = [],
  unavailableTimes = new Set(),
  isLoadingAvailability = false,
  // Duração somada dos serviços e último horário que ainda termina antes do
  // fechamento: juntos explicam por que os horários do fim do dia sumiram.
  totalDuration = 0,
  latestStart = null,
}) {
  const days = useMemo(() => getAvailableDays(hours), [hours]);
  const activeDay = days.find((day) => day.iso === selectedDate);
  const monthLabel = activeDay?.monthLabel ?? days[0]?.monthLabel;

  const morningTimes = slots.filter((time) => Number(time.split(":")[0]) < 12);
  const afternoonTimes = slots.filter((time) => {
    const hour = Number(time.split(":")[0]);
    return hour >= 12 && hour < 18;
  });
  const eveningTimes = slots.filter((time) => Number(time.split(":")[0]) >= 18);

  const groupedSlots = [
    { id: "morning", label: "Manhã", slots: toSlots(morningTimes, unavailableTimes) },
    { id: "afternoon", label: "Tarde", slots: toSlots(afternoonTimes, unavailableTimes) },
    { id: "evening", label: "Noite", slots: toSlots(eveningTimes, unavailableTimes) },
  ].filter((period) => period.slots.length > 0);

  return (
    <section aria-labelledby="datetime-section-title">
      {/* Em tela estreita o título e o mês dividem a linha e, quando não cabem,
          quebram — antes se espremiam. As setas de mês saíram: eram botões sem
          ação nenhuma, e a grade mostra os próximos dias, não um mês inteiro. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id="datetime-section-title" className="font-display text-lg font-semibold text-gray-900">
          {heading ?? monthLabel}
        </h2>
        {heading && <p className="text-sm text-gray-400">{monthLabel}</p>}
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

      {/* O atendimento tem de terminar antes de o salão fechar, então os
          horários do fim do dia desaparecem conforme os serviços escolhidos
          ficam mais longos. Sem este aviso a grade parece simplesmente vazia. */}
      {totalDuration > 0 && !activeDay?.disabled && (
        <>
          {latestStart === null ? (
            <p
              role="alert"
              className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              Os serviços escolhidos levam {totalDuration} min e não cabem no horário de
              funcionamento deste dia. Escolha outro dia ou remova um procedimento.
            </p>
          ) : (
            <p className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              O atendimento leva {totalDuration} min e precisa terminar antes de o salão fechar:
              neste dia, o último horário possível é {latestStart}.
            </p>
          )}
        </>
      )}

      {isLoadingAvailability && <p className="mt-3 text-xs text-gray-400">Verificando disponibilidade...</p>}

      {!isLoadingAvailability && groupedSlots.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          {activeDay?.disabled ? "O salão não abre nesse dia." : "Nenhum horário disponível para esse dia."}
        </p>
      )}

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
