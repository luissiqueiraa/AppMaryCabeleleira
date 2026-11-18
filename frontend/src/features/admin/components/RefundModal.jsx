import { useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { formatBRL } from "../../../shared/utils/formatCurrency";
import { formatDateOnly, formatTime } from "../../../shared/utils/formatDate";
import { formatServiceNames } from "../../../shared/utils/formatServices";
import { whatsappUrl } from "../../../shared/utils/whatsapp";
import { useSalonContact } from "../../../shared/hooks/useSalonContact";

const PAYMENT_METHOD_LABEL = { pix: "Pix", card: "Cartão", on_site: "No salão" };

// Card de estorno: atendimento cancelado que já estava pago. A equipe chama a
// cliente no WhatsApp (mensagem já escrita) para combinar a devolução, faz o
// estorno fora do sistema e volta aqui para registrar. "appointment" é o DTO
// da API, como o histórico usa.
export default function RefundModal({ appointment, isSaving, onMarkRefunded, onClose }) {
  const dialogRef = useRef(null);
  const salon = useSalonContact();

  useEffect(() => {
    if (appointment) dialogRef.current?.focus();
  }, [appointment]);

  if (!appointment) return null;

  const { client } = appointment;
  const firstName = client.fullName?.split(" ")[0] ?? "";
  const amount = formatBRL(appointment.price);
  const message =
    `Olá, ${firstName}! Aqui é do ${salon?.name ?? "salão"}. Vi que o seu agendamento de ` +
    `${formatServiceNames(appointment.services)} do dia ${formatDateOnly(appointment.scheduledAt)} às ` +
    `${formatTime(appointment.scheduledAt)} foi cancelado e você já tinha pago ${amount}. ` +
    "Vamos combinar a devolução?";
  const link = whatsappUrl(client.phoneNumber, message);
  const isOnline = appointment.paymentMethod !== "on_site";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/40" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        tabIndex={-1}
        className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="refund-title" className="font-display text-lg font-semibold text-gray-900">
            Estornar valor
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mt-1 -mr-2 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-4 space-y-2 rounded-lg border border-gray-100 p-3 text-sm">
          <Row label="Cliente" value={client.fullName} />
          <Row label="Telefone" value={client.phoneNumber || "Não cadastrado"} />
          <Row label="Atendimento" value={formatServiceNames(appointment.services)} />
          <Row label="Data" value={`${formatDateOnly(appointment.scheduledAt)} · ${formatTime(appointment.scheduledAt)}`} />
          <Row label="Pago por" value={PAYMENT_METHOD_LABEL[appointment.paymentMethod] ?? appointment.paymentMethod} />
          <div className="flex justify-between gap-4 border-t border-gray-100 pt-2">
            <dt className="text-gray-500">A devolver</dt>
            <dd className="font-display text-base font-semibold text-gray-900">{amount}</dd>
          </div>
        </dl>

        <p className="mt-3 text-xs text-gray-500">
          {isOnline
            ? "Pago online: o estorno pode ser feito no painel do Mercado Pago, ou combine outra forma com a cliente."
            : "Pago no salão: combine com a cliente como devolver (pix ou dinheiro)."}
        </p>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <FaWhatsapp size={16} aria-hidden="true" />
            Chamar {firstName} no WhatsApp
          </a>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            A cliente não tem um telefone válido cadastrado.
          </p>
        )}

        <button
          type="button"
          onClick={() => onMarkRefunded(appointment)}
          disabled={isSaving}
          className="mt-3 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Registrando..." : "Já devolvi — marcar como estornado"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}
