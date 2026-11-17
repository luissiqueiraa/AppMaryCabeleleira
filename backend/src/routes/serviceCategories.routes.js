import { Router } from "express";
import * as categoriesController from "../controllers/serviceCategories.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import { createCategorySchema, updateCategorySchema } from "../validators/serviceCategories.validator.js";
import { idParamSchema } from "../validators/common.validator.js";

const router = Router();

router.use(authenticate);

// Qualquer usuária logada lê a lista (a tela de agendamento agrupa por
// categoria); criar e alterar exige a mesma permissão do catálogo.
router.get("/", categoriesController.listCategories);
router.post(
  "/",
  authorize("manage_services"),
  validateRequest(createCategorySchema),
  categoriesController.createCategory
);
router.patch(
  "/:id",
  authorize("manage_services"),
  validateRequest(updateCategorySchema),
  categoriesController.updateCategory
);
router.delete(
  "/:id",
  authorize("manage_services"),
  validateRequest(idParamSchema),
  categoriesController.deleteCategory
);

export default router;
