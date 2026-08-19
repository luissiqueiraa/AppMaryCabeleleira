import { Router } from "express";
import * as rolesController from "../controllers/roles.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../validators/roles.validator.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = Router();

// manage_roles hoje só existe na role "owner" (ver seed) — isso já restringe
// toda a CRUD de roles ao owner sem precisar hardcodar a checagem aqui.
router.use(authenticate, authorize("manage_roles"));

router.get("/", rolesController.listRoles);
router.post("/", validateRequest(createRoleSchema), rolesController.createRole);
router.patch("/:id", validateRequest(updateRoleSchema), rolesController.updateRole);
router.delete("/:id", validateRequest(idParamSchema), rolesController.deleteRole);

export default router;
