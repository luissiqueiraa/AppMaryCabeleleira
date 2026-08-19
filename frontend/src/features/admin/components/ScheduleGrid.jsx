import { resolveAssetUrl } from "../../../shared/utils/assetUrl";
import { avatarColorFor } from "../../../shared/utils/avatarColor";

const ROW_HEIGHT = 64;
const HEADER_HEIGHT = 56;

function ProfessionalAvatar({ id, avatarUrl }) {
  if (avatarUrl) {
    return (
      <img
        src={resolveAssetUrl(avatarUrl)}
        alt=""
        aria-hidden="true"
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  const { from, to } = avatarColorFor(id);
  return (
    <span
      className="h-9 w-9 shrink-0 rounded-full"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    />
  );
}

export default function ScheduleGrid({ professionals, hours, events }) {
  if (professionals.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Nenhuma profissional cadastrada ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
            <ProfessionalAvatar id={professional.id} avatarUrl={professional.avatarUrl} />
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
            <div
              key={event.id}
              className="m-1 overflow-hidden rounded-md border border-pink-300 bg-pink-100 p-2 text-xs text-pink-700"
              style={{ gridColumn: colIndex + 2, gridRow: `${rowIndex + 2} / span ${event.rowSpan}` }}
            >
              <p className="truncate font-semibold">{event.service}</p>
              <p className="truncate text-gray-600">{event.client}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
