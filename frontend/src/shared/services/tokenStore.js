// Access token só em memória — nunca em localStorage/sessionStorage.
// Isso limita o impacto de um XSS: um script injetado não consegue ler o
// token de um storage persistente. Ao recarregar a página, o token se
// perde de propósito; o AuthContext recupera a sessão via refresh-token
// (cookie httpOnly) no boot da aplicação.
let accessToken = null;
let unauthorizedHandlers = [];

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function onUnauthorized(handler) {
  unauthorizedHandlers.push(handler);
  return () => {
    unauthorizedHandlers = unauthorizedHandlers.filter((item) => item !== handler);
  };
}

export function notifyUnauthorized() {
  unauthorizedHandlers.forEach((handler) => handler());
}
