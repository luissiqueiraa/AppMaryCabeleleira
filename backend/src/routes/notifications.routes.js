import { Router } from "express";
import * as notificationsController from "../controllers/notifications.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", notificationsController.listNotifications);
router.patch("/read", notificationsController.markAllAsRead);

export default router;
