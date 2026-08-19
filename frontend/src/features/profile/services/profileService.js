import { api } from "../../../shared/services/api";

export async function getProfile() {
  const { data } = await api.get("/v1/profile");
  return data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch("/v1/profile", payload);
  return data;
}

export async function changePassword(payload) {
  const { data } = await api.post("/v1/profile/change-password", payload);
  return data;
}

export async function updatePhoneNumber(payload) {
  const { data } = await api.patch("/v1/profile/phone", payload);
  return data;
}

export async function deleteAccount() {
  const { data } = await api.delete("/v1/profile");
  return data;
}
