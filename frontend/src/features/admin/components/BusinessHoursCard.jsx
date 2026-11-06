import Switch from "../../../shared/components/Switch";

export default function BusinessHoursCard({ hours, onChange }) {
  function toggleDay(id) {
    onChange(hours.map((day) => (day.id === id ? { ...day, enabled: !day.enabled } : day)));
  }

  function updateTime(id, field, value) {
    onChange(hours.map((day) => (day.id === id ? { ...day, [field]: value } : day)));
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <h3 className="font-display text-lg font-semibold text-gray-900">Horário de funcionamento</h3>
      <p className="mt-1 text-sm text-gray-500">Define a janela em que clientes podem agendar.</p>

      <ul className="mt-5 divide-y divide-gray-100">
        {hours.map((day) => (
          <li key={day.id} className="flex flex-wrap items-center gap-4 py-3">
            <Switch checked={day.enabled} onChange={() => toggleDay(day.id)} label={day.label} />
            <span className="w-20 shrink-0 text-sm font-medium text-gray-700">{day.label}</span>

            <div className="ml-auto flex items-center gap-3">
              <input
                type="time"
                value={day.open}
                disabled={!day.enabled}
                onChange={(event) => updateTime(day.id, "open", event.target.value)}
                className="w-28 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <span className="text-gray-400">—</span>
              <input
                type="time"
                value={day.close}
                disabled={!day.enabled}
                onChange={(event) => updateTime(day.id, "close", event.target.value)}
                className="w-28 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
