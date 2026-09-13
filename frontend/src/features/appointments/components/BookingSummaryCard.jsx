import { FiCalendar, FiClock, FiCheck } from "react-icons/fi";

function formatPrice(value) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BookingSummaryCard({
  service,
  professionalName,
  dateLabel,
  time,
  isLoading,
  isComplete,
  onConfirm,
}) {
  return (
    <section aria-label="Resumo do agendamento" className="lg:sticky lg:top-6">
      <div className="relative overflow-hidden rounded-lg bg-pink-600 p-6 text-white">
        <p className="text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">Resumo</p>
        <h3 className="font-display mt-2 text-2xl font-semibold">
          {service ? service.name : "Selecione um serviço"}
        </h3>
        {professionalName && <p className="mt-1 text-sm text-white/85">com {professionalName}</p>}

        {(dateLabel || time) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {dateLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium">
                <FiCalendar aria-hidden="true" />
                {dateLabel}
              </span>
            )}
            {time && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium">
                <FiClock aria-hidden="true" />
                {time}
              </span>
            )}
          </div>
        )}
      </div>

      <dl className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-5 text-sm shadow-sm">
        <Row label="Duração" value={`${service ? service.duration : 0} min`} />
        <Row label="Pagamento" value="No salão" />
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-gray-500">Total estimado</p>
          <p className="font-display text-lg font-semibold text-gray-900">
            R$ {formatPrice(service ? service.price : 0)}
          </p>
        </div>
      </dl>

      <button
        type="button"
        onClick={onConfirm}
        disabled={!isComplete || isLoading}
        className="mt-4 hidden w-full items-center justify-center gap-2 rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50 lg:flex"
      >
        <FiCheck aria-hidden="true" />
        {isLoading ? "Confirmando..." : "Confirmar agendamento"}
      </button>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
