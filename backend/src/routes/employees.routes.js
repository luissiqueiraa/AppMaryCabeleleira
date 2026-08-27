import { Router } from "express";
import * as employeesController from "../controllers/employees.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  createEmployeeSchema,
  createEmployeeFromUserSchema,
  updateEmployeeSchema,
} from "../validators/employees.validator.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", employeesController.listEmployees);
router.post(
  "/",
  authorize("manage_users"),
  validateRequest(createEmployeeSchema),
  employeesController.createEmployee
);
router.post(
  "/from-user",
  authorize("manage_users"),
  validateRequest(createEmployeeFromUserSchema),
  employeesController.createEmployeeFromUser
);
router.patch(
  "/:id",
  authorize("manage_users"),
  validateRequest(updateEmployeeSchema),
  employeesController.updateEmployee
);
router.delete(
  "/:id",
  authorize("manage_users"),
  validateRequest(idParamSchema),
  employeesController.deleteEmployee
);

export default router;
