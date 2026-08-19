import { env } from "../config/env.js";
import * as authService from "../services/auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

function setRefreshTokenCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body, req);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body, req);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(
      incomingToken,
      req
    );
    setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(incomingToken, req);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id, req);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, data: { message: "All sessions were revoked" } });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateMyAvatar(req, res, next) {
  try {
    const user = await authService.updateAvatar(req.user.id, req.file.filename, req);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
