import axios from "axios";
import { ENV } from "../../config/env";
import { getAccessToken, setAccessToken, clearAccessToken, notifyUnauthorized } from "./tokenStore";

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_ENDPOINTS_WITHOUT_RETRY = ["/auth/login", "/auth/register", "/auth/refresh-token"];

let refreshPromise = null;

function isAuthEndpoint(url = "") {
  return AUTH_ENDPOINTS_WITHOUT_RETRY.some((path) => url.includes(path));
}

// Dedupa chamadas concorrentes a /refresh-token (ex.: o bootstrap do AuthProvider
// rodando duas vezes por causa do StrictMode) em uma única requisição. O refresh
// token é rotacionado a cada uso no backend; disparar duas chamadas em paralelo
// com o mesmo token faz a segunda ser lida como reuso e revoga todas as sessões.
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api.post("/v1/auth/refresh-token").finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || !config || isAuthEndpoint(config.url) || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const { data } = await refreshAccessToken();
      const newAccessToken = data?.data?.accessToken;
      setAccessToken(newAccessToken);
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(config);
    } catch (refreshError) {
      clearAccessToken();
      notifyUnauthorized();
      return Promise.reject(refreshError);
    }
  }
);
