import { ENV } from "../../config/env";
import { getAccessToken, setAccessToken } from "./tokenStore";
import { refreshAccessToken } from "./api";
import { parseSseBlock } from "../utils/parseSse";

// Conexão com GET /appointments/events (Server-Sent Events). O EventSource do
// navegador não manda o header Authorization, e o access token vive só em
// memória — por isso a leitura é feita com fetch e o stream lido à mão.
// Reconecta sozinho com espera crescente (a conexão cai em deploy, troca de
// rede, notebook dormindo) e renova o token quando ele expira.

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

// onEvent: cada mudança de agendamento. onReconnect: a conexão voltou depois de
// cair — algo pode ter mudado no intervalo, então a tela deve recarregar.
// Devolve a função que encerra a conexão.
export function subscribeToAppointmentEvents({ onEvent, onReconnect }) {
  const controller = new AbortController();
  let stopped = false;
  let retryMs = FIRST_RETRY_MS;
  let connectedBefore = false;

  const open = () =>
    fetch(`${ENV.API_URL}/v1/appointments/events`, {
      headers: { Authorization: `Bearer ${getAccessToken()}`, Accept: "text/event-stream" },
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

  async function read(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let end = buffer.indexOf("\n\n");
      while (end !== -1) {
        const message = parseSseBlock(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
        end = buffer.indexOf("\n\n");
        if (!message) continue;
        if (message.event === "ready") {
          retryMs = FIRST_RETRY_MS;
          if (connectedBefore) onReconnect?.();
          connectedBefore = true;
        } else if (message.event === "appointment") {
          onEvent?.(message.data);
        }
      }
    }
  }

  async function run() {
    while (!stopped) {
      try {
        let response = await open();
        if (response.status === 401) {
          // Token de 15 min venceu com a aba aberta: renova e tenta de novo.
          const { data } = await refreshAccessToken();
          setAccessToken(data?.data?.accessToken);
          response = await open();
        }
        // Sem permissão não adianta insistir: quem não é da equipe não tem
        // painel em tempo real.
        if (response.status === 403) return;
        if (response.ok && response.body) await read(response.body);
      } catch {
        // Queda de rede, servidor reiniciando, refresh negado: espera e tenta.
      }
      if (stopped) return;
      await new Promise((resolve) => setTimeout(resolve, retryMs));
      retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
    }
  }

  run();
  return () => {
    stopped = true;
    controller.abort();
  };
}
