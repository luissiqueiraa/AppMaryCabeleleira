import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken({ userId, role, permissions }) {
  return jwt.sign({ sub: userId, role, permissions }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

// Refresh token é opaco (não-JWT): assinatura/algoritmo não importam aqui,
// só precisa ser imprevisível e nunca guardado em texto puro (ver hashToken).
export function generateRefreshToken() {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000);
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}
