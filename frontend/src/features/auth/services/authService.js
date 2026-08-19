import { api } from "../../../shared/services/api";

export async function login({ email, password }) {
  const { data } = await api.post("/v1/auth/login", { email, password });
  return data;
}

export async function register({
  fullName,
  email,
  phoneNumber,
  birthDate,
  password,
  confirmPassword,
  referralSource,
}) {
  const { data } = await api.post("/v1/auth/register", {
    fullName,
    email,
    phoneNumber,
    birthDate,
    password,
    confirmPassword,
    referralSource,
  });
  return data;
}

export async function refreshToken() {
  const { data } = await api.post("/v1/auth/refresh-token");
  return data;
}

export async function logout() {
  const { data } = await api.post("/v1/auth/logout");
  return data;
}

export async function logoutAll() {
  const { data } = await api.post("/v1/auth/logout-all");
  return data;
}

export async function me() {
  const { data } = await api.get("/v1/auth/me");
  return data;
}

export async function forgotPassword({ email }) {
  const { data } = await api.post("/v1/auth/forgot-password", { email });
  return data;
}

export async function resetPassword({ token, newPassword }) {
  const { data } = await api.post("/v1/auth/reset-password", { token, newPassword });
  return data;
}
