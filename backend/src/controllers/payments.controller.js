import * as paymentsService from "../services/payments.service.js";

export async function createPayment(req, res, next) {
  try {
    const payment = await paymentsService.createPayment(req.body, req);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

export async function getPayment(req, res, next) {
  try {
    const payment = await paymentsService.getPayment(req.params.id);
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
}

// O Mercado Pago reenvia a notificação até receber 2xx. Por isso respondemos
// 200 mesmo para notificação de pagamento que não interessa: do contrário o
// provedor ficaria repetindo para sempre algo que nunca vamos processar.
export async function handleWebhook(req, res, next) {
  try {
    await paymentsService.handleProviderNotification({ body: req.body, headers: req.headers });
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}
