import { Router } from "express";
import * as permissionsController from "../controllers/permissions.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("manage_roles"), permissionsController.listPermissions);

export default router;
