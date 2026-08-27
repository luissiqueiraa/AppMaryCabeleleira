import { api } from "./api";

// GET é acessível a qualquer usuário autenticado (o fluxo de agendamento do
// cliente também precisa do horário de funcionamento). PATCH é restrito a
// quem tem a permission manage_settings — o backend já aplica essa regra.
export async function getSettings() {
  const { data } = await api.get("/v1/settings");
  return data;
}

export async function updateSettings(payload) {
  const { data } = await api.patch("/v1/settings", payload);
  return data;
}
