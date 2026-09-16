import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Gera o access token (JWT curto, padrão 15min) que o frontend manda no header
// Authorization. As permissions vão dentro do payload para o authorize evitar
// uma consulta ao banco a cada requisição — por isso trocar a role de alguém só
// vale a partir do próximo refresh, quando o token é reemitido.
export function signAccessToken({ userId, role, permissions }) {
  return jwt.sign({ sub: userId, role, permissions }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

// Confere assinatura e validade do access token e devolve o payload. Lança se o
// token for inválido ou expirado — quem chama (auth.middleware) traduz em 401.
export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

// Refresh token é opaco (não-JWT): assinatura/algoritmo não importam aqui,
// só precisa ser imprevisível e nunca guardado em texto puro (ver hashToken).
// Devolve o valor cru (vai no cookie httpOnly), o hash (é o que fica no banco)
// e a data de expiração.
export function generateRefreshToken() {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000);
  return { rawToken, tokenHash: hashToken(rawToken), expiresAt };
}

// Hash de mão única usado tanto para gravar quanto para procurar um token: se o
// banco vazar, os tokens armazenados não servem para se passar por ninguém.
export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// Token aleatório de uso geral — hoje é o que vai no link de redefinição de
// senha (guardado no banco só como hash, igual ao refresh token).
export function generateRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}
