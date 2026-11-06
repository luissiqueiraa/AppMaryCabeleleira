import { jest } from "@jest/globals";
import crypto from "node:crypto";

const SEGREDO = "segredo-do-webhook";

jest.unstable_mockModule("../../src/config/env.js", () => ({
  env: {
    mercadoPago: { accessToken: "TEST-token", webhookSecret: SEGREDO, apiUrl: "https://api.mercadopago.com" },
    publicApiUrl: "https://salao.example.com",
    pixExpirationMinutes: 30,
    corsOrigin: "https://salao.example.com",
  },
}));

const { isWebhookSignatureValid } = await import("../../src/config/mercadopago.js");

// Assinatura como o Mercado Pago monta: HMAC-SHA256 do manifesto
// id:<data.id>;request-id:<x-request-id>;ts:<ts>;
function assinar({ dataId, requestId, ts }) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  return crypto.createHmac("sha256", SEGREDO).update(manifest).digest("hex");
}

describe("assinatura do webhook", () => {
  const dataId = "123456789";
  const requestId = "req-abc";
  const ts = "1700000000";

  it("aceita assinatura correta", () => {
    const v1 = assinar({ dataId, requestId, ts });

    expect(isWebhookSignatureValid({ signature: `ts=${ts},v1=${v1}`, requestId, dataId })).toBe(true);
  });

  it("recusa assinatura de outro segredo", () => {
    const v1 = crypto.createHmac("sha256", "segredo-errado").update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");

    expect(isWebhookSignatureValid({ signature: `ts=${ts},v1=${v1}`, requestId, dataId })).toBe(false);
  });

  it("recusa quando o id do pagamento foi trocado", () => {
    const v1 = assinar({ dataId, requestId, ts });

    expect(isWebhookSignatureValid({ signature: `ts=${ts},v1=${v1}`, requestId, dataId: "999" })).toBe(false);
  });

  it("recusa quando o timestamp foi trocado", () => {
    const v1 = assinar({ dataId, requestId, ts });

    expect(isWebhookSignatureValid({ signature: `ts=1700009999,v1=${v1}`, requestId, dataId })).toBe(false);
  });

  it.each([
    ["sem cabeçalho", undefined],
    ["vazio", ""],
    ["sem o v1", "ts=1700000000"],
    ["sem o ts", "v1=abcdef"],
    ["lixo", "qualquer-coisa"],
  ])("recusa cabeçalho %s", (_rotulo, signature) => {
    expect(isWebhookSignatureValid({ signature, requestId, dataId })).toBe(false);
  });

  it("recusa v1 com tamanho diferente (evita comparação que vaza tempo)", () => {
    expect(isWebhookSignatureValid({ signature: `ts=${ts},v1=ab`, requestId, dataId })).toBe(false);
  });
});
