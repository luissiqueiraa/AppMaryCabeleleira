import { whatsappUrl, needsRefund } from "../src/shared/utils/whatsapp.js";

describe("whatsappUrl", () => {
  it("aceita telefone formatado e acrescenta o 55 do Brasil", () => {
    expect(whatsappUrl("(17) 99634-5332")).toBe("https://wa.me/5517996345332");
  });

  it("mantém número que já vem com o 55", () => {
    expect(whatsappUrl("+55 21 99766-5443")).toBe("https://wa.me/5521997665443");
  });

  it("tira o zero de discagem do DDD", () => {
    expect(whatsappUrl("017 99634-5332")).toBe("https://wa.me/5517996345332");
  });

  it("leva a mensagem escrita, codificada", () => {
    expect(whatsappUrl("21997665443", "Olá, tudo bem?")).toBe(
      "https://wa.me/5521997665443?text=Ol%C3%A1%2C%20tudo%20bem%3F"
    );
  });

  it("sem telefone válido não gera link", () => {
    expect(whatsappUrl(null)).toBeNull();
    expect(whatsappUrl("1234")).toBeNull();
  });
});

describe("needsRefund", () => {
  it("só cancelado e pago precisa de estorno", () => {
    expect(needsRefund({ status: "cancelled", paymentStatus: "paid" })).toBe(true);
    expect(needsRefund({ status: "cancelled", paymentStatus: "pending" })).toBe(false);
    expect(needsRefund({ status: "cancelled", paymentStatus: "refunded" })).toBe(false);
    expect(needsRefund({ status: "confirmed", paymentStatus: "paid" })).toBe(false);
  });
});
