import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { recordAuditLog } from "../utils/auditLogger.js";
import * as mercadoPago from "../config/mercadopago.js";
import * as paymentsRepository from "../repositories/payments.repository.js";
import * as authRepository from "../repositories/auth.repository.js";
import * as appointmentsService from "./appointments.service.js";
import * as notificationsService from "./notifications.service.js";

const ONLINE_METHODS = ["pix", "card"];

function toPaymentDto(payment) {
  return {
    id: payment.id,
    method: payment.method,
    status: payment.status,
    amount: Number(payment.amount),
    scheduledAt: payment.scheduledAt,
    durationMinutes: payment.durationMinutes,
    services: payment.services,
    checkoutUrl: payment.checkoutUrl,
    pixQrCode: payment.pixQrCode,
    pixQrCodeBase64: payment.pixQrCodeBase64,
    expiresAt: payment.expiresAt,
    paidAt: payment.paidAt,
    appointmentId: payment.appointmentId,
    failureReason: payment.failureReason,
  };
}

export function getPaymentOwnerId(id) {
  return paymentsRepository.findPaymentById(id).then((payment) => payment?.clientId ?? null);
}

// Abre a cobrança. O horário NÃO é reservado aqui: a validação é para não
// cobrar por um horário que já está claramente ocupado, mas a vaga só vira
// agendamento quando o pagamento for aprovado.
export async function createPayment({ serviceIds, employeeId, scheduledAt, method, notes }, req) {
  if (!ONLINE_METHODS.includes(method)) {
    throw new AppError("Payment method does not require online payment", 422);
  }
  if (!mercadoPago.isOnlinePaymentEnabled()) {
    throw new AppError("Online payment is not configured", 503);
  }

  const { services, durationMinutes, price } = await appointmentsService.prepareBooking({
    serviceIds,
    employeeId,
    scheduledAt,
  });

  // Uma cobrança pendente por horário: recarregar a tela não pode gerar
  // um segundo pix para o mesmo atendimento.
  const existing = await paymentsRepository.findPendingPaymentFor({
    clientId: req.user.id,
    employeeId,
    scheduledAt,
  });
  if (existing && existing.method === method) {
    return toPaymentDto(existing);
  }

  const expiresAt = new Date(Date.now() + env.pixExpirationMinutes * 60000);
  // Snapshot do que foi vendido: é ele que vale na criação do agendamento,
  // mesmo que o catálogo mude enquanto a cliente paga.
  const servicesSnapshot = services.map((service) => ({
    id: service.id,
    name: service.name,
    price: Number(service.price),
    durationMinutes: service.duration,
  }));

  const payment = await paymentsRepository.createPayment({
    clientId: req.user.id,
    method,
    amount: price,
    employeeId,
    scheduledAt,
    durationMinutes,
    services: servicesSnapshot,
    notes,
    expiresAt,
  });

  const description = servicesSnapshot.map((service) => service.name).join(" + ");
  // O token só carrega id/role/permissions; o provedor exige e-mail e nome de
  // quem paga, então os dados vêm do banco.
  const client = await authRepository.findUserById(req.user.id);
  const [firstName, ...rest] = (client?.fullName ?? "Cliente").split(" ");
  const payer = {
    email: client?.email,
    firstName,
    lastName: rest.join(" ") || firstName,
  };

  let providerData;
  try {
    providerData =
      method === "pix"
        ? await mercadoPago.createPixPayment({
            paymentId: payment.id,
            amount: Number(price),
            description,
            payer,
            expiresAt,
          })
        : await mercadoPago.createCardCheckout({
            paymentId: payment.id,
            amount: Number(price),
            description,
            payer,
            expiresAt,
            returnUrl: `${env.corsOrigin}/payments/${payment.id}`,
          });
  } catch (error) {
    // Cobrança que não chegou a existir no provedor não pode ficar pendente
    // para sempre esperando uma baixa que nunca vem.
    await paymentsRepository.updatePayment(payment.id, {
      status: "failed",
      failureReason: "provider_error",
    });
    throw error;
  }

  const updated = await paymentsRepository.updatePayment(payment.id, {
    providerPaymentId: providerData.providerPaymentId,
    checkoutUrl: providerData.checkoutUrl,
    pixQrCode: providerData.pixQrCode ?? null,
    pixQrCodeBase64: providerData.pixQrCodeBase64 ?? null,
  });

  await recordAuditLog({
    userId: req.user.id,
    action: "payment.create",
    entity: "Payment",
    entityId: payment.id,
    req,
  });

  return toPaymentDto(updated);
}

// Consulta usada pela tela de espera. Além de ler o banco, reconcilia com o
// provedor: em desenvolvimento o webhook não alcança localhost, e em produção
// uma notificação pode se perder — o polling fecha esse buraco.
export async function getPayment(id) {
  let payment = await paymentsRepository.findPaymentById(id);
  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status === "pending" && payment.providerPaymentId) {
    payment = await reconcile(payment);
  }

  if (payment.status === "pending" && payment.expiresAt <= new Date()) {
    payment = await paymentsRepository.updatePayment(payment.id, { status: "expired" });
  }

  return toPaymentDto(payment);
}

async function reconcile(payment) {
  const providerPayment = await mercadoPago.getPayment(payment.providerPaymentId);
  if (providerPayment.status === "approved") {
    return confirmPayment(payment, providerPayment);
  }
  if (["rejected", "cancelled"].includes(providerPayment.status)) {
    return paymentsRepository.updatePayment(payment.id, {
      status: "failed",
      failureReason: providerPayment.status,
    });
  }
  return payment;
}

// Único lugar que transforma pagamento aprovado em agendamento. Idempotente:
// webhook repetido, polling simultâneo e retentativa do provedor caem todos
// no mesmo caminho e só o primeiro cria o agendamento.
async function confirmPayment(payment, providerPayment) {
  if (payment.status === "paid" || payment.appointmentId) {
    return payment;
  }

  // O valor cobrado tem de ser o valor que o salão pediu. Divergência aqui
  // significa cobrança adulterada — não vira agendamento.
  if (Math.abs(providerPayment.amount - Number(payment.amount)) > 0.009) {
    return paymentsRepository.updatePayment(payment.id, {
      status: "failed",
      failureReason: "amount_mismatch",
    });
  }

  try {
    const appointment = await appointmentsService.createAppointmentForPayment(payment);
    const updated = await paymentsRepository.updatePayment(payment.id, {
      status: "paid",
      paidAt: new Date(),
      appointmentId: appointment.id,
      providerPaymentId: payment.providerPaymentId ?? providerPayment.providerPaymentId,
    });

    await notificationsService.notifyUser(payment.clientId, {
      type: "confirmation",
      title: "Pagamento confirmado",
      description: `${payment.services.map((service) => service.name).join(" + ")} confirmado para ${payment.scheduledAt.toLocaleDateString("pt-BR")}.`,
    });

    return updated;
  } catch (error) {
    // Pagou e o horário já era: a cobrança fica marcada para devolução e a
    // cliente é avisada. Devolver em si é manual no painel do Mercado Pago —
    // dinheiro de volta não sai daqui sem alguém olhar.
    const reason = error?.statusCode === 409 ? "slot_taken" : "booking_failed";
    const updated = await paymentsRepository.updatePayment(payment.id, {
      status: "failed",
      failureReason: reason,
      paidAt: new Date(),
    });

    await notificationsService.notifyUser(payment.clientId, {
      type: "update",
      title: "Não foi possível concluir o agendamento",
      description:
        "Seu pagamento foi recebido, mas o horário não está mais disponível. O salão vai entrar em contato para devolver o valor ou remarcar.",
    });

    console.error("Paid payment could not become an appointment:", payment.id, reason);
    return updated;
  }
}

// Webhook do Mercado Pago. O corpo da notificação não é confiável: ele só
// aponta qual pagamento olhar, e a resposta vem da API do provedor.
export async function handleProviderNotification({ body, headers }) {
  const dataId = body?.data?.id ?? body?.["data.id"];
  const type = body?.type ?? body?.topic;
  if (!dataId || (type && type !== "payment")) {
    return { ignored: true };
  }

  const signatureValid = mercadoPago.isWebhookSignatureValid({
    signature: headers["x-signature"],
    requestId: headers["x-request-id"],
    dataId,
  });
  if (signatureValid === false) {
    throw new AppError("Invalid webhook signature", 401);
  }

  const providerPayment = await mercadoPago.getPayment(dataId);
  // Pix já nasce com o id do provedor; cartão só se liga aqui, pelo
  // external_reference que mandamos na preferência.
  const payment =
    (await paymentsRepository.findPaymentByProviderId(String(dataId))) ??
    (providerPayment.externalReference
      ? await paymentsRepository.findPaymentById(providerPayment.externalReference)
      : null);

  if (!payment) {
    console.warn("Webhook for unknown payment:", dataId);
    return { ignored: true };
  }

  if (providerPayment.status === "approved") {
    await confirmPayment(payment, providerPayment);
    return { handled: true };
  }

  if (["rejected", "cancelled"].includes(providerPayment.status) && payment.status === "pending") {
    await paymentsRepository.updatePayment(payment.id, {
      status: "failed",
      failureReason: providerPayment.status,
    });
  }

  return { handled: true };
}
