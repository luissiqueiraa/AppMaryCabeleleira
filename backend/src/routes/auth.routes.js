import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validateRequest.middleware.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateMeSchema,
  changeMyPasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/google", validateRequest(googleLoginSchema), authController.googleLogin);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/logout-all", authenticate, authController.logoutAll);
router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, validateRequest(updateMeSchema), authController.updateMe);
router.post(
  "/me/change-password",
  authenticate,
  validateRequest(changeMyPasswordSchema),
  authController.changeMyPassword
);
router.delete("/me", authenticate, authController.deleteMe);
router.patch("/me/avatar", authenticate, uploadAvatar, authController.updateMyAvatar);
router.post("/forgot-password", validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
