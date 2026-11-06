import { api } from "../../../shared/services/api";

// Conteúdo do site institucional: serviços, equipe e dados do salão vindos do
// banco, numa chamada só. Rota pública — a home é vista por quem não tem conta.
export async function getHomeContent() {
  const { data } = await api.get("/v1/public/home");
  return data;
}
