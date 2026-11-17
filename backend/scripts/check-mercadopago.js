// Diagnóstico da credencial do Mercado Pago. Responde três perguntas que
// explicam quase toda falha de pagamento: de quem é este token, é de teste ou
// de produção, e o pix está habilitado nessa conta.
//
//   docker compose exec backend node scripts/check-mercadopago.js
//
// Não cria cobrança nem move dinheiro: só faz duas consultas de leitura.
import "dotenv/config";
import { env } from "../src/config/env.js";

const token = env.mercadoPago.accessToken;

function titulo(texto) {
  console.log(`\n${texto}`);
  console.log("-".repeat(texto.length));
}

async function consultar(caminho) {
  const response = await fetch(`${env.mercadoPago.apiUrl}${caminho}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const corpo = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, corpo };
}

if (!token) {
  console.log("MERCADOPAGO_ACCESS_TOKEN não está definido — o pagamento online está desligado.");
  console.log('O app oferece apenas "pagar no salão", o que é o comportamento esperado.');
  process.exit(0);
}

titulo("Credencial");
const prefixo = token.slice(0, token.indexOf("-") + 1) || token.slice(0, 8);
console.log(`prefixo: ${prefixo}  (TEST- = credencial de teste, APP_USR- = de produção)`);
console.log(`api: ${env.mercadoPago.apiUrl}`);

const me = await consultar("/users/me");
if (!me.ok) {
  console.log(`\nA consulta da conta falhou: HTTP ${me.status}`);
  console.log(JSON.stringify(me.corpo)?.slice(0, 300));
  console.log("\nToken inválido, revogado ou de outro país. Gere a credencial de novo no painel.");
  process.exit(1);
}

const conta = me.corpo;
const ehContaDeTeste = (conta.tags ?? []).includes("test_user");

titulo("Conta que vai receber");
console.log(`id: ${conta.id}`);
console.log(`apelido: ${conta.nickname}`);
console.log(`email: ${conta.email}`);
console.log(`país: ${conta.site_id}`);
console.log(`é conta de teste? ${ehContaDeTeste ? "SIM" : "não — é uma conta real"}`);

const metodos = await consultar("/v1/payment_methods");
const ids = Array.isArray(metodos.corpo) ? metodos.corpo.map((m) => m.id) : [];
const pixHabilitado = ids.includes("pix");
const cartoes = Array.isArray(metodos.corpo)
  ? [...new Set(metodos.corpo.filter((m) => (m.payment_type_id ?? "").includes("card")).map((m) => m.id))]
  : [];

titulo("Meios de pagamento habilitados");
console.log(`pix: ${pixHabilitado ? "SIM" : "NÃO"}`);
console.log(`cartão: ${cartoes.length ? cartoes.join(", ") : "nenhum"}`);

titulo("Conclusão");
if (pixHabilitado && cartoes.length) {
  console.log("Pix e cartão prontos para cobrar.");
} else if (!pixHabilitado) {
  console.log("O pix vai recusar com 401 'Unauthorized use of live credentials'.");
  console.log("A causa é uma destas duas, nesta ordem de probabilidade:");
  console.log("");
  if (ehContaDeTeste) {
    console.log("1. Esta é uma CONTA DE TESTE, e contas de teste não permitem");
    console.log("   cadastrar chave pix. Não há como habilitar o pix aqui — use a");
    console.log("   credencial de produção de uma conta real que tenha chave pix.");
  } else {
    console.log("1. As credenciais de produção ainda não foram ATIVADAS. No painel:");
    console.log("   Suas integrações → sua aplicação → Credenciais de produção →");
    console.log("   responder o questionário de ativação.");
    console.log("2. A conta não tem chave pix cadastrada:");
    console.log("   Seu negócio → Configurações → Pix → cadastrar chave.");
  }
  console.log("");
  console.log("Enquanto isso o app mostra 'O pix está indisponível no momento.'");
  console.log("e segue oferecendo cartão e pagar no salão.");
}

if (ehContaDeTeste) {
  console.log("\nComo é conta de teste, nenhum pagamento aqui movimenta dinheiro real.");
} else {
  console.log("\nATENÇÃO: conta real. Todo pagamento é dinheiro de verdade, e");
  console.log("cartões de teste passam a ser recusados. Devolução é manual no painel.");
}
