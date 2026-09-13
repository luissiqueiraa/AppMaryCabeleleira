import { Router } from "express";
import * as clientsController from "../controllers/clients.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize, authorizeAny } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = Router();
router.use(authenticate);

router.get("/", authorizeAny("manage_users", "view_clients"), clientsController.listClients);
router.delete(
  "/:id",
  authorize("manage_users"),
  validateRequest(idParamSchema),
  clientsController.deleteClient
);

export default router;
