import { Link } from "react-router-dom";
import { FiRepeat } from "react-icons/fi";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { repeatLink } from "../utils/repeatLink";

const PAYMENT_METHOD_LABEL = { pix: "Pix", card: "Cartão", on_site: "No salão" };

// Conteúdo que aparece ao abrir um atendimento do histórico. Compartilhado
// entre o card do celular e a linha da tabela, para os dois mostrarem a mesma
// coisa.
export default function HistoryDetails({ item }) {
  const metodo = PAYMENT_METHOD_LABEL[item.paymentMethod] ?? item.paymentMethod;
  const pago = item.paymentStatus === "paid";

  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
          {item.services?.length > 1 ? "Serviços" : "Serviço"}
        </p>
        <ul className="mt-1.5 space-y-1">
          {(item.services ?? []).map((service) => (
            <li key={service.id} className="flex justify-between gap-4 text-gray-600">
              <span>
                {service.name}
                <span className="text-gray-400"> · {service.durationMinutes} min</span>
              </span>
              <span className="shrink-0 font-medium text-gray-900">{formatBRL(service.price)}</span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <Info label="Profissional" value={item.professional} />
        <Info label="Duração total" value={item.durationMinutes ? `${item.durationMinutes} min` : "—"} />
        <Info label="Quando" value={`${item.date}${item.time ? `, ${item.time}` : ""}`} />
        <Info
          label="Pagamento"
          value={
            <>
              {metodo}
              {metodo && " · "}
              <span className={pago ? "text-emerald-600" : "text-amber-600"}>
                {pago ? "pago" : "a receber"}
              </span>
            </>
          }
        />
      </dl>

      {item.notes && (
        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Observação</p>
          <p className="mt-1 text-gray-600">{item.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
        <span className="font-display text-base font-semibold text-gray-900">{item.price}</span>

        {/* Repetir leva os mesmos serviços e a mesma profissional já escolhidos. */}
        {item.status === "completed" && (
          <Link
            to={repeatLink(item)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-pink-600 px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-50"
          >
            <FiRepeat size={12} aria-hidden="true" />
            Repetir
          </Link>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-gray-400 uppercase">{label}</dt>
      <dd className="mt-0.5 text-gray-600">{value}</dd>
    </div>
  );
}
