// Link "clique para conversar" do WhatsApp (wa.me), que abre o app no celular e
// o WhatsApp Web no computador, já com a mensagem escrita. Telefones do
// cadastro vêm em qualquer formato — "(17) 99634-5332", "21997665443" — e o
// WhatsApp exige só dígitos com o código do país. Sem DDI, vale o Brasil (55).
export function whatsappUrl(phone, message) {
  let digits = String(phone ?? "").replace(/\D/g, "");
  // Número nacional com 0 do DDD ("017...") — o zero é de discagem, não do número.
  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length < 12) return null;

  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

// Atendimento cancelado depois de pago: o dinheiro entrou e precisa voltar.
export function needsRefund(appointment) {
  return appointment?.status === "cancelled" && appointment?.paymentStatus === "paid";
}
