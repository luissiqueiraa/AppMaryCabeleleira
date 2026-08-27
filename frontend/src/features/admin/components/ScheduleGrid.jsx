import Avatar from "../../../shared/components/Avatar";

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 56;

const STATUS_STYLES = {
  confirmed: "border-pink-300 bg-pink-100 text-pink-700",
  completed: "border-purple-300 bg-purple-50 text-purple-700",
};

export default function ScheduleGrid({ professionals, hours, events, onSelectEvent }) {
  if (professionals.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Nenhuma profissional cadastrada ainda.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: sem grade nem scroll horizontal — uma lista por profissional. */}
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white lg:hidden">
        {professionals.map((professional) => {
          const professionalEvents = events
            .filter((event) => event.employeeId === professional.id)
            .sort((a, b) => a.startHour - b.startHour);

          return (
            <div key={professional.id} className="p-4">
              <div className="flex items-center gap-2">
                <Avatar name={professional.name} avatarUrl={professional.avatarUrl} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{professional.name}</p>
                  <p className="text-xs text-gray-400">{professional.count} hoje</p>
                </div>
              </div>

              {professionalEvents.length === 0 ? (
                <p className="mt-3 text-xs text-gray-400">Nenhum agendamento hoje.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {professionalEvents.map((event) => (
                    <li key={event.id}>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(event)}
                        className={`w-full rounded-md border p-2 text-left text-xs ${STATUS_STYLES[event.status] ?? STATUS_STYLES.confirmed}`}
                      >
                        <p className="font-semibold">
                          {String(event.startHour).padStart(2, "0")}:00 · {event.service}
                        </p>
                        <p className="text-gray-600">{event.client}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: grade hora x profissional. */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white lg:block">
        <div
          className="grid min-w-[900px]"
          style={{
            gridTemplateColumns: `72px repeat(${professionals.length}, minmax(160px, 1fr))`,
            gridTemplateRows: `${HEADER_HEIGHT}px repeat(${hours.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="sticky top-0 z-10 col-start-1 row-start-1 border-b border-gray-100 bg-white" />

          {professionals.map((professional, index) => (
            <div
              key={professional.id}
              className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white px-3"
              style={{ gridColumn: index + 2, gridRow: 1 }}
            >
              <Avatar name={professional.name} avatarUrl={professional.avatarUrl} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{professional.name}</p>
                <p className="text-xs text-gray-400">{professional.count} hoje</p>
              </div>
            </div>
          ))}

          {hours.map((hour, rowIndex) => (
            <div
              key={hour}
              className="border-t border-gray-100 px-2 pt-1 text-xs text-gray-400"
              style={{ gridColumn: 1, gridRow: rowIndex + 2 }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}

          {professionals.map((professional, colIndex) =>
            hours.map((hour, rowIndex) => (
              <div
                key={`${professional.id}-${hour}`}
                className="border-t border-l border-gray-100"
                style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
              />
            )),
          )}

          {events.map((event) => {
            const colIndex = professionals.findIndex((p) => p.id === event.employeeId);
            const rowIndex = hours.indexOf(event.startHour);
            if (colIndex === -1 || rowIndex === -1) return null;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent(event)}
                className={`m-1 overflow-hidden rounded-md border p-2 text-left text-xs ${STATUS_STYLES[event.status] ?? STATUS_STYLES.confirmed}`}
                style={{ gridColumn: colIndex + 2, gridRow: `${rowIndex + 2} / span ${event.rowSpan}` }}
              >
                <p className="truncate font-semibold">{event.service}</p>
                <p className="truncate text-gray-600">{event.client}</p>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
