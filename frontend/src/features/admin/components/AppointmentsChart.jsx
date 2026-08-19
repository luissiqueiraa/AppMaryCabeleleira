import { useState } from "react";

const PERIODS = [
  { id: "7d", label: "7d", days: 7 },
  { id: "14d", label: "14d", days: 14 },
  { id: "30d", label: "30d", days: 14 },
];

export default function AppointmentsChart({ dailyAppointments }) {
  const [periodId, setPeriodId] = useState("14d");
  const period = PERIODS.find((item) => item.id === periodId);
  const visibleDays = dailyAppointments.slice(-period.days);
  const maxValue = Math.max(1, ...visibleDays.map((day) => day.value));

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-gray-900">Agendamentos por dia</h2>
          <p className="text-sm text-gray-400">Últimos {period.days} dias</p>
        </div>
        <div className="flex gap-1 rounded-full border border-gray-200 p-1">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriodId(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                periodId === item.id ? "bg-pink-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex h-40 items-end gap-2">
        {visibleDays.map((day) => (
          <div key={day.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-md bg-gradient-to-t from-pink-500 to-pink-300"
              style={{ height: `${Math.max((day.value / maxValue) * 100, 4)}%` }}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-400">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
