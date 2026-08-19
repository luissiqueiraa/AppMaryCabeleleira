import { ENV } from "../../config/env";

// ENV.API_URL inclui o sufixo /api (usado como baseURL do axios para as rotas
// /v1/...), mas arquivos estáticos (/uploads/...) são servidos na raiz do
// backend — precisamos montar a URL sem esse sufixo.
const ORIGIN = ENV.API_URL.replace(/\/api\/?$/, "");

export function resolveAssetUrl(path) {
  if (!path) return null;
  return `${ORIGIN}${path}`;
}
