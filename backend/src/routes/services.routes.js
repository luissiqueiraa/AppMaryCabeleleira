import { Router } from "express";
import * as servicesController from "../controllers/services.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createServiceSchema, updateServiceSchema } from "../validators/services.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", servicesController.listServices);
router.post("/", authorize("manage_services"), validateRequest(createServiceSchema), servicesController.createService);
router.patch(
  "/:id",
  authorize("manage_services"),
  validateRequest(updateServiceSchema),
  servicesController.updateService
);

export default router;
