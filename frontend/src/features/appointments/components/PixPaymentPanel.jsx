import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCopy, FiCheck, FiClock, FiAlertTriangle } from "react-icons/fi";
import { formatBRL } from "../../../shared/utils/formatCurrency";

function minutesLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 60000));
}

// Tela de espera do pix. O horário ainda não é da cliente aqui: só depois da
// confirmação do pagamento ele é reservado, e é isso que o texto avisa.
export default function PixPaymentPanel({ payment, onCancel }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(payment.pixQrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard bloqueado (http, permissão negada): o código fica à vista
      // para a cliente copiar na mão.
      setCopied(false);
    }
  }

  if (payment.status === "expired" || payment.status === "failed") {
    const expirou = payment.status === "expired";
    return (
      <div className="mx-auto max-w-md px-6 py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <FiAlertTriangle size={24} aria-hidden="true" />
        </span>
        <h2 className="font-display mt-4 text-xl font-semibold text-gray-900">
          {expirou ? "O prazo do pix terminou" : "O pagamento não foi concluído"}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {payment.failureReason === "slot_taken"
            ? "Recebemos seu pagamento, mas outra cliente ficou com o horário antes da confirmação. O salão vai entrar em contato para devolver o valor ou remarcar."
            : "Nenhum valor foi cobrado. Você pode escolher o horário de novo."}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 w-full rounded-lg bg-pink-600 py-3 text-sm font-semibold text-white hover:bg-pink-700"
        >
          Escolher outro horário
        </button>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-medium text-gray-500 hover:text-gray-700">
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <h2 className="font-display text-center text-xl font-semibold text-gray-900">
        Pague {formatBRL(payment.amount)} com pix
      </h2>
      <p className="mt-2 text-center text-sm text-gray-500">
        O horário é reservado assim que o pagamento for confirmado — isso costuma levar alguns
        segundos. Mantenha esta tela aberta.
      </p>

      {payment.pixQrCodeBase64 && (
        <img
          src={`data:image/png;base64,${payment.pixQrCodeBase64}`}
          alt="QR Code do pix"
          className="mx-auto mt-6 h-56 w-56 rounded-lg border border-gray-200 bg-white p-2"
        />
      )}

      {payment.pixQrCode && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700">Ou copie o código do pix</p>
          <p className="mt-1.5 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs break-all text-gray-600">
            {payment.pixQrCode}
          </p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-pink-600 py-2.5 text-sm font-semibold text-pink-600 hover:bg-pink-50"
          >
            {copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        </div>
      )}

      <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500">
        <FiClock aria-hidden="true" />
        Aguardando pagamento · expira em {minutesLeft(payment.expiresAt)} min
      </p>

      <button
        type="button"
        onClick={onCancel}
        className="mt-4 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Cancelar e voltar
      </button>
    </div>
  );
}
