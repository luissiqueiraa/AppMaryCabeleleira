import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/AppError.js";

const AVATARS_DIR = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(AVATARS_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, AVATARS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const avatarMulter = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError("Only JPEG, PNG or WEBP images are allowed", 422));
    }
    cb(null, true);
  },
});

// Traduz MulterError (limite de tamanho etc.) para AppError, em vez de deixar
// o errorHandler tratar como 500 genérico.
export function uploadAvatar(req, res, next) {
  avatarMulter.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Avatar must be at most 2MB" : "Invalid avatar upload";
      return next(new AppError(message, 422));
    }
    if (err) return next(err);
    if (!req.file) return next(new AppError("Avatar file is required", 400));
    next();
  });
}
