import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { uploadLogo } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { updateSettingsSchema } from "../validators/settings.validator.js";

const router = Router();
router.use(authenticate);

// GET é aberto a qualquer usuário autenticado: o fluxo de agendamento do
// cliente também precisa ler o horário de funcionamento, não é só admin.
router.get("/", settingsController.getSettings);
router.patch(
  "/",
  authorize("manage_settings"),
  validateRequest(updateSettingsSchema),
  settingsController.updateSettings
);
router.patch("/logo", authorize("manage_settings"), uploadLogo, settingsController.updateLogo);

export default router;
