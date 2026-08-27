import { Router } from "express";
import * as clientsController from "../controllers/clients.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAny } from "../middlewares/authorize.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", authorizeAny("manage_users", "view_clients"), clientsController.listClients);

export default router;
