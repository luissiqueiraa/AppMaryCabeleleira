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

export async function uploadSalonLogo(file) {
  const formData = new FormData();
  formData.append("logo", file);
  const { data } = await api.patch("/v1/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Zona de perigo: apaga os dados e restaura o padrão de fábrica. O backend só
// aceita da owner, com a frase de confirmação e a senha atual.
export async function resetSystem(payload) {
  const { data } = await api.post("/v1/settings/reset", payload);
  return data;
}
