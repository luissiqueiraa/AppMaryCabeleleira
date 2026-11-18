import { FaWhatsapp } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { useSalonContact } from "../../../shared/hooks/useSalonContact";
import { needsRefund, whatsappUrl } from "../../../shared/utils/whatsapp";

// Aviso para a cliente que cancelou (ou teve cancelado) um horário já pago: o
// valor volta para ela, e a devolução é combinada direto com o salão pelo
// WhatsApp. Depois que a equipe registra o estorno, o aviso vira confirmação.
// "appointment" é o agendamento já mapeado (mapAppointment).
export default function RefundNotice({ appointment, className = "" }) {
  const salon = useSalonContact();

  if (appointment?.paymentStatus === "refunded") {
    return (
      <p className={`flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ${className}`}>
        <FiCheckCircle className="shrink-0" aria-hidden="true" />
        O salão registrou a devolução de {appointment.price}.
      </p>
    );
  }

  if (!needsRefund(appointment)) return null;

  const message =
    `Olá! Cancelei o agendamento de ${appointment.service} do dia ${appointment.date} às ` +
    `${appointment.time}, que já estava pago (${appointment.price}). Gostaria de combinar o estorno.`;
  const link = whatsappUrl(salon?.phone, message);

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 ${className}`}>
      <p className="text-sm font-semibold text-amber-900">
        Você tem {appointment.price} para receber de volta
      </p>
      <p className="mt-1 text-sm text-amber-800">
        Este agendamento foi cancelado depois do pagamento. Fale com o salão para combinar o estorno.
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          <FaWhatsapp size={16} aria-hidden="true" />
          Falar pelo WhatsApp
        </a>
      ) : (
        salon && (
          <p className="mt-3 text-sm text-amber-800">
            {salon.phone ? `Ligue para o salão: ${salon.phone}` : "Entre em contato com o salão."}
          </p>
        )
      )}
    </div>
  );
}
