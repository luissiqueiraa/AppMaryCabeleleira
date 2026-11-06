import { Router } from "express";
import * as paymentsController from "../controllers/payments.controller.js";
import * as paymentsService from "../services/payments.service.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeOwnership } from "../middlewares/ownership.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createPaymentSchema, getPaymentSchema } from "../validators/payments.validator.js";

const router = Router();

// Webhook vem do Mercado Pago, não de um usuário logado: fica antes do
// authenticate e se defende por conta própria (assinatura + consulta à API do
// provedor antes de confiar em qualquer coisa).
router.post("/webhook", paymentsController.handleWebhook);

router.use(authenticate);

const getPaymentOwnerId = (req) => paymentsService.getPaymentOwnerId(req.params.id);

router.post("/", validateRequest(createPaymentSchema), paymentsController.createPayment);

router.get(
  "/:id",
  validateRequest(getPaymentSchema),
  authorizeOwnership(getPaymentOwnerId, ["manage_appointments"]),
  paymentsController.getPayment
);

export default router;
