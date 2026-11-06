import crypto from "node:crypto";
import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";

// Cliente REST do Mercado Pago em fetch puro, sem SDK: são quatro chamadas e
// o SDK traria uma dependência a mais para versionar. A URL base é
// configurável para que os testes apontem para um servidor-falso local.

export function isOnlinePaymentEnabled() {
  return Boolean(env.mercadoPago.accessToken);
}

function assertEnabled() {
  if (!isOnlinePaymentEnabled()) {
    throw new AppError("Online payment is not configured", 503);
  }
}

async function request(path, { method = "GET", body, idempotencyKey, unavailableMessage } = {}) {
  assertEnabled();
  const response = await fetch(`${env.mercadoPago.apiUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.mercadoPago.accessToken}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    // A mensagem do provedor vai para o log, nunca para a cliente: pode conter
    // detalhe de conta e não ajuda quem está tentando pagar.
    console.error("Mercado Pago request failed:", response.status, JSON.stringify(payload));
    // 401 numa cobrança significa meio de pagamento não habilitado na conta
    // do salão (o caso típico é pix sem chave cadastrada) — não é instabilidade
    // do provedor, e a cliente precisa saber que a outra forma funciona.
    if (response.status === 401 && unavailableMessage) {
      throw new AppError(unavailableMessage, 503);
    }
    throw new AppError("Payment provider is unavailable", 502);
  }
  return payload;
}

// O webhook só é aceito se vier com destino configurado; sem URL pública o
// provedor não teria para onde avisar e o app depende do polling.
function notificationUrl() {
  return env.publicApiUrl ? `${env.publicApiUrl}/api/v1/payments/webhook` : undefined;
}

// localhost e 127.0.0.1 não são alcançáveis pelo provedor.
function isPublicUrl(url) {
  return Boolean(url) && !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i.test(url);
}

// Pix: a cobrança já nasce com QR Code e "copia e cola" na resposta.
export async function createPixPayment({ paymentId, amount, description, payer, expiresAt }) {
  const data = await request("/v1/payments", {
    method: "POST",
    idempotencyKey: paymentId,
    unavailableMessage: "Pix is not available right now",
    body: {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",
      date_of_expiration: expiresAt.toISOString().replace("Z", "-00:00"),
      external_reference: paymentId,
      notification_url: notificationUrl(),
      payer: {
        email: payer.email,
        first_name: payer.firstName,
        last_name: payer.lastName,
      },
    },
  });

  const transaction = data?.point_of_interaction?.transaction_data ?? {};
  return {
    providerPaymentId: String(data.id),
    status: data.status,
    pixQrCode: transaction.qr_code ?? null,
    pixQrCodeBase64: transaction.qr_code_base64 ?? null,
    checkoutUrl: transaction.ticket_url ?? null,
  };
}

// Cartão: Checkout Pro. A cliente digita o cartão no ambiente do Mercado Pago
// — dado de cartão nunca passa por este servidor, o que mantém o PCI fora do
// nosso escopo. O id do pagamento só aparece depois, no webhook.
export async function createCardCheckout({ paymentId, amount, description, payer, expiresAt, returnUrl }) {
  const data = await request("/checkout/preferences", {
    method: "POST",
    idempotencyKey: paymentId,
    unavailableMessage: "Card payment is not available right now",
    body: {
      items: [
        {
          id: paymentId,
          title: description,
          quantity: 1,
          unit_price: Number(amount),
          currency_id: "BRL",
        },
      ],
      payer: { email: payer.email, name: payer.firstName, surname: payer.lastName },
      // Só cartão: pix tem fluxo próprio no app e boleto não serve para
      // reservar horário (demora dias para compensar).
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }, { id: "atm" }],
        installments: 1,
      },
      external_reference: paymentId,
      notification_url: notificationUrl(),
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
      // auto_return (voltar sozinho para o app ao aprovar) exige uma URL
      // pública: com localhost o Mercado Pago recusa a preferência inteira.
      // Em desenvolvimento a cliente volta pelo botão do checkout.
      ...(isPublicUrl(returnUrl) ? { auto_return: "approved" } : {}),
      expires: true,
      expiration_date_to: expiresAt.toISOString().replace("Z", "-00:00"),
    },
  });

  return {
    providerPaymentId: null, // chega no webhook, junto com o pagamento em si
    status: "pending",
    checkoutUrl: data.init_point ?? data.sandbox_init_point ?? null,
  };
}

// Fonte da verdade sobre um pagamento. É o que faz o webhook ser seguro: a
// notificação só diz "olha o pagamento X", e quem responde se foi aprovado é
// a API do provedor, não o corpo da requisição que chegou.
export async function getPayment(providerPaymentId) {
  const data = await request(`/v1/payments/${providerPaymentId}`);
  return {
    providerPaymentId: String(data.id),
    status: data.status,
    amount: Number(data.transaction_amount),
    externalReference: data.external_reference ?? null,
    method: data.payment_method_id ?? null,
  };
}

// Assinatura do webhook (x-signature: ts=...,v1=...). Confere que a
// notificação veio mesmo do Mercado Pago antes de qualquer trabalho.
export function isWebhookSignatureValid({ signature, requestId, dataId }) {
  const secret = env.mercadoPago.webhookSecret;
  if (!secret) return null; // não configurado: quem valida é o getPayment

  const parts = Object.fromEntries(
    String(signature ?? "")
      .split(",")
      .map((part) => part.split("=").map((piece) => piece.trim()))
  );
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const received = Buffer.from(parts.v1, "hex");
  const computed = Buffer.from(expected, "hex");
  return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}
