import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import rolesRoutes from "./roles.routes.js";
import permissionsRoutes from "./permissions.routes.js";
import employeesRoutes from "./employees.routes.js";
import clientsRoutes from "./clients.routes.js";
import servicesRoutes from "./services.routes.js";
import appointmentsRoutes from "./appointments.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/roles", rolesRoutes);
router.use("/permissions", permissionsRoutes);
router.use("/employees", employeesRoutes);
router.use("/clients", clientsRoutes);
router.use("/services", servicesRoutes);
router.use("/appointments", appointmentsRoutes);

export default router;
