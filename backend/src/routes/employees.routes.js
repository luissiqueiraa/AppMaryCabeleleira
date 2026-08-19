import { Router } from "express";
import * as employeesController from "../controllers/employees.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createEmployeeSchema } from "../validators/employees.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", employeesController.listEmployees);
router.post(
  "/",
  authorize("manage_users"),
  validateRequest(createEmployeeSchema),
  employeesController.createEmployee
);

export default router;
