import { FiX, FiClock } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Switch from "../../../shared/components/Switch";
import { avatarColorFor } from "../../../shared/utils/avatarColor";
import { resolveAssetUrl } from "../../../shared/utils/assetUrl";

const MONTH_ABBR = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(":").map(Number);
  const total = (hours * 60 + mins + minutes + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function BookingConfirmationModal({
  service,
  professional,
  professionalName,
  date,
  dateLabel,
  time,
  payOnSite,
  onTogglePayOnSite,
  notes,
  onNotesChange,
  isLoading,
  error,
  isComplete,
  onConfirm,
  onClose,
  onEditService,
}) {
  const dateObj = date ? new Date(`${date}T00:00:00`) : null;
  const day = dateObj ? dateObj.getDate() : null;
  const monthAbbr = dateObj ? MONTH_ABBR[dateObj.getMonth()] : null;
  const endTime = service && time ? addMinutes(time, service.duration) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/50"
      />

      <div className="animate-slide-up relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <img
              src="/Mary_Cabelereira.jpeg"
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">MaryCabeleleira</p>
              <p className="text-xs text-gray-500">{dateLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onEditService}
              className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-100"
            >
              Alterar serviço
            </button>
          </div>

          <div className="mt-2 flex items-center gap-4 rounded-lg border border-gray-200 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold text-gray-900">{service?.name}</p>

              <div className="mt-2 flex items-center gap-2">
                {professional ? (
                  professional.user.avatarUrl ? (
                    <img
                      src={resolveAssetUrl(professional.user.avatarUrl)}
                      alt=""
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="h-6 w-6 shrink-0 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColorFor(professional.id).from}, ${avatarColorFor(professional.id).to})`,
                      }}
                      aria-hidden="true"
                    />
                  )
                ) : (
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                    aria-hidden="true"
                  >
                    <HiSparkles size={12} className="text-pink-400" />
                  </span>
                )}
                <p className="text-sm text-gray-600">{professionalName}</p>
              </div>

              <p className="mt-3 text-xs text-gray-400">A partir de:</p>
              <p className="text-lg font-semibold text-emerald-600">
                {service ? `R$ ${formatPrice(service.price)}` : "—"}
              </p>

              {time && endTime && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                  <FiClock aria-hidden="true" />
                  {time} - {endTime} ({service.duration} min)
                </p>
              )}
            </div>

            {day && (
              <div className="shrink-0 text-center">
                <p className="font-display text-2xl font-bold text-gray-900">{day}</p>
                <p className="text-xs font-semibold tracking-wide text-gray-400">{monthAbbr}</p>
              </div>
            )}
          </div>

          <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-pink-200 bg-pink-50 p-4">
            <span className="text-sm font-medium text-pink-700">
              Quero pagar na hora (após o atendimento)
            </span>
            <Switch
              checked={payOnSite}
              onChange={onTogglePayOnSite}
              label="Quero pagar na hora (após o atendimento)"
            />
          </label>

          <div className="mt-4">
            <label htmlFor="booking-notes" className="text-sm font-medium text-gray-700">
              Alguma observação?
            </label>
            <textarea
              id="booking-notes"
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Ex: Não precisa lavar, etc.."
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus-visible:border-pink-600 focus-visible:ring-2 focus-visible:ring-pink-100"
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={!isComplete || isLoading}
            className="mt-4 w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
