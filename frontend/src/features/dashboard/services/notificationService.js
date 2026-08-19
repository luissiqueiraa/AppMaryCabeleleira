import { api } from "../../../shared/services/api";

export async function listNotifications() {
  const { data } = await api.get("/v1/notifications");
  return data;
}

export async function markNotificationsRead() {
  const { data } = await api.patch("/v1/notifications/read");
  return data;
}
