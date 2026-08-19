import { Router } from "express";
import * as usersController from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { authorizeOwnership } from "../middlewares/ownership.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { listUsersQuerySchema, userIdParamSchema, assignRoleSchema } from "../validators/users.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("manage_users"), validateRequest(listUsersQuerySchema), usersController.listUsers);

router.get(
  "/:id",
  validateRequest(userIdParamSchema),
  authorizeOwnership((req) => req.params.id, ["manage_users"]),
  usersController.getUser
);

router.patch(
  "/:id/roles",
  authorize("manage_users"),
  validateRequest(assignRoleSchema),
  usersController.assignRole
);

export default router;
