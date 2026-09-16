import { ENV } from "../../config/env";

// ENV.API_URL inclui o sufixo /api (usado como baseURL do axios para as rotas
// /v1/...), mas arquivos estáticos (/uploads/...) são servidos na raiz do
// backend — precisamos montar a URL sem esse sufixo.
const ORIGIN = ENV.API_URL.replace(/\/api\/?$/, "");

export function resolveAssetUrl(path) {
  if (!path) return null;
  // Foto de perfil vinda do Google já é uma URL absoluta — só os caminhos
  // relativos (/uploads/...) precisam do prefixo do backend.
  if (/^https?:\/\//i.test(path)) return path;
  return `${ORIGIN}${path}`;
}
