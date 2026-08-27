import { api } from "../../../shared/services/api";

export async function updateProfile(payload) {
  const { data } = await api.patch("/v1/auth/me", payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await api.post("/v1/auth/me/change-password", payload);
  return data;
}

export async function updatePhoneNumber(payload) {
  const { data } = await api.patch("/v1/auth/me", payload);
  return data;
}

export async function updatePreferences(payload) {
  const { data } = await api.patch("/v1/auth/me", payload);
  return data;
}

export async function deleteAccount() {
  const { data } = await api.delete("/v1/auth/me");
  return data;
}
