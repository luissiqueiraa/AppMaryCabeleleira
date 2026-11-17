# Pagamento online (Mercado Pago)

Como ligar o pagamento por pix e cartão no app. Sem as variáveis de ambiente
abaixo o pagamento online fica **desligado**: o app oferece só "pagar no salão"
e a API recusa pix/cartão com `503`. Nada quebra enquanto você não configurar.

## 1. Criar a aplicação no Mercado Pago

1. Entre em <https://www.mercadopago.com.br/developers/panel> com a conta do
   salão (a mesma que vai receber o dinheiro).
2. **Suas integrações → Criar aplicação**.
3. Nome: `MaryCabeleleira` (ou o que preferir).
4. Em "Produto que vai integrar", escolha **Pagamentos online → Checkout Pro**.
   É o que usamos para cartão; o pix usa a mesma aplicação.
5. Salve.

## 2. Pegar as credenciais de teste

1. Na aplicação criada, abra **Credenciais de teste** no menu lateral.
2. Copie o **Access Token** — começa com `TEST-`.
   - O *Public Key* não é usado por esta integração: o cartão é digitado no
     ambiente do Mercado Pago (Checkout Pro), não no nosso formulário.
3. Guarde também o **usuário de teste** (Contas de teste): é com ele que você
   simula a cliente pagando, sem mover dinheiro real.

As credenciais de **produção** ficam em "Credenciais de produção" e só devem
entrar no `.env` quando você terminar os testes. Elas exigem completar os dados
da conta (CNPJ/CPF, dados bancários) no painel.

## 3. Configurar o backend

No arquivo `backend/.env`:

```env
# Access Token da aplicação (TEST-... em teste, APP_USR-... em produção)
MERCADOPAGO_ACCESS_TOKEN=TEST-0000000000000000-000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-000000000

# Endereço público deste backend. Usado para montar a URL de webhook que o
# Mercado Pago chama. Em produção é o domínio real; em desenvolvimento, a URL
# do túnel (passo 5).
PUBLIC_API_URL=https://api.seudominio.com.br

# Segredo da assinatura do webhook (passo 4). Sem ele a notificação continua
# sendo validada contra a API do provedor, mas a assinatura não é conferida.
MERCADOPAGO_WEBHOOK_SECRET=

# Opcional: minutos de validade da cobrança pix (padrão 30)
PIX_EXPIRATION_MINUTES=30
```

Reinicie a API: `docker compose restart backend`.

Para conferir se ligou, peça as configurações do salão com qualquer usuária
logada — a resposta passa a trazer `"onlinePaymentsEnabled": true`:

```bash
curl -s http://localhost:3000/api/v1/settings -H "Authorization: Bearer <token>" | grep onlinePayments
```

> **Ao trocar uma variável, recrie o container — não basta reiniciar.** O
> `docker-compose.yml` usa `env_file`, e o Compose injeta essas variáveis no
> ambiente do container **na criação**. Um `docker compose restart` reaproveita
> o container, e o `dotenv` não sobrescreve variável que já existe no ambiente:
> o `.env` fica com o valor novo e o processo segue com o velho, sem nenhum
> aviso. O certo é:
>
> ```bash
> docker compose up -d --force-recreate backend
> ```
>
> Para conferir qual valor o processo realmente tem, rode `npm run check:mp`:
> ele mostra de qual conta é o token em uso.

## 4. Configurar o webhook

O webhook é o que avisa o app que o pagamento entrou. **É ele que cria o
agendamento** — sem webhook (ou sem o polling do passo 5) a cliente paga e o
horário não é reservado.

1. No painel da aplicação: **Webhooks → Configurar notificações**.
2. URL de produção: `https://api.seudominio.com.br/api/v1/payments/webhook`
3. Em "Eventos", marque **Pagamentos** (`payment`).
4. Salve e copie a **assinatura secreta** que o painel mostra para
   `MERCADOPAGO_WEBHOOK_SECRET`.

A rota é pública de propósito (a notificação não vem de uma usuária logada),
mas ela não confia no corpo da requisição: confere a assinatura e depois
pergunta à API do Mercado Pago qual é o status real do pagamento.

## 4.1. Habilitar o pix na conta que recebe

Cartão funciona assim que o token entra. **Pix não**: a conta que recebe precisa
ter uma chave pix cadastrada, senão a API do Mercado Pago recusa a cobrança com
`401 Unauthorized use of live credentials` e o pix nem aparece em
`GET /v1/payment_methods`.

Para habilitar:

1. Abra <https://www.mercadopago.com.br> numa janela anônima e entre com a conta
   que recebe o dinheiro (em teste, o usuário de teste vendedor).
2. **Seu negócio → Configurações → Pix** (ou "Minha conta → Chaves Pix").
3. Cadastre uma chave — CPF/CNPJ, e-mail ou chave aleatória.
4. Confira: a cobrança passa a funcionar e `pix` aparece ativo em

```bash
curl -s https://api.mercadopago.com/v1/payment_methods \
  -H "Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN" | grep -o '"id":"pix"'
```

Enquanto o pix não estiver habilitado, o app mostra "O pix está indisponível no
momento. Use cartão ou pague no salão." em vez de um erro genérico.

## 4.1.1. Diagnosticar a credencial

Antes de caçar erro no código, pergunte à API de quem é o token:

```bash
docker compose exec backend npm run check:mp
```

Ele responde de quem é a credencial, se a conta é de teste ou real, e se o pix
está habilitado — e, quando não está, diz qual das causas é. Não cria cobrança
nem move dinheiro.

**Conta de teste não cadastra chave pix.** O painel do Mercado Pago não oferece
a seção de Pix em contas de teste, então não há como habilitar o pix ali. Em
teste, o cartão funciona e o pix não: é uma limitação do provedor, não do app.
Para exercitar o pix é preciso a credencial de **produção** de uma conta real
que tenha chave cadastrada — e aí todo pagamento é dinheiro de verdade.

### Usar a credencial de produção em desenvolvimento

Funciona, e às vezes é o único jeito de ver o pix de ponta a ponta. O que muda:

| | Em teste | Com credencial de produção |
|---|---|---|
| Pix | recusado (sem chave) | funciona |
| Cartões de teste | funcionam | **recusados** |
| Dinheiro | nenhum | real, com taxa do Mercado Pago |
| Devolução | — | manual, no painel |

Para não gastar, cadastre um serviço de centavos no painel do salão e agende
esse. E lembre: `.env` não vai para o Git, mas credencial de produção em
máquina de desenvolvimento é credencial exposta — ao publicar, gere um par
novo e deixe este só para a sua máquina.

## 4.2. Criar o usuário de teste comprador

Em teste são necessárias **duas** contas: a vendedora (de onde vem o access
token) e uma compradora, que paga. Em **Suas integrações → sua aplicação →
Contas de teste**, crie uma segunda conta e use o login dela para pagar o pix ou
o cartão no checkout. Pagar com a própria conta vendedora é recusado pelo
Mercado Pago.

## 5. Testar em desenvolvimento

O Mercado Pago não alcança `localhost`, então há dois caminhos:

**Com túnel (testa o webhook de verdade)**

```bash
npx localtunnel --port 3000      # ou ngrok http 3000
```

Coloque a URL gerada em `PUBLIC_API_URL`, configure o webhook do painel para
`<url>/api/v1/payments/webhook` e reinicie a API.

**Sem túnel (só polling)** — recomendado para desenvolver

Funciona sem configurar nada, e vale para pix **e** cartão: a tela de espera
pergunta o status ao backend a cada 4 segundos, o backend consulta o Mercado
Pago e cria o agendamento nessa consulta, pelo mesmo caminho do webhook. É mais
lento, mas não exige endereço público.

Os dois meios chegam ao pagamento de formas diferentes, e é por isso que o
cartão precisou de tratamento próprio:

| | Como o backend acha o pagamento |
|---|---|
| **Pix** | A cobrança nasce com o id do provedor na resposta; basta consultá-lo |
| **Cartão** | A preferência do Checkout Pro é criada **antes** de o pagamento existir, então não há id. O pagamento é procurado por `external_reference` (`GET /v1/payments/search`), que é o id da nossa cobrança |

Sem essa busca por referência, uma cobrança de cartão ficaria pendente para
sempre em localhost, esperando um webhook que nunca chega.

> O `auto_return` (voltar sozinho ao app depois de aprovar) exige endereço
> público — com localhost o Mercado Pago recusa a preferência inteira. O código
> omite esse campo quando a URL não é pública, e a cliente volta pelo botão
> "Voltar ao site" do checkout. O resto do fluxo é idêntico.

### Roteiro de teste

1. Entre no app como cliente, escolha serviços, profissional e horário.
2. Em "Como você quer pagar?", escolha **Pix**.
3. Confirme: aparece o QR Code e o copia-e-cola.
4. Pague com o **usuário de teste** do Mercado Pago (app ou simulador do
   painel).
5. Em alguns segundos a tela vira "Tudo certo!" e o agendamento aparece em
   "Meus agendamentos" com pagamento `pix / pago`.
6. Repita escolhendo **Cartão**: o app leva para o Checkout Pro, e ao voltar a
   tela `/payments/<id>` mostra o resultado. Cartões de teste estão em
   <https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards>.

## 6. Ir para produção

1. Troque `MERCADOPAGO_ACCESS_TOKEN` pelo de produção (`APP_USR-...`).
2. Aponte `PUBLIC_API_URL` para o domínio real e reconfigure o webhook com essa
   URL.
3. Faça um agendamento de verdade, de valor baixo, e confirme no extrato do
   Mercado Pago.

## Como o fluxo funciona (e por que assim)

A regra escolhida é **reservar o horário só depois do pagamento aprovado**.
Então:

1. A cliente escolhe pix/cartão → a API cria uma linha em `payments` com o
   atendimento pretendido (profissional, horário, serviços com preço
   congelado). **Nenhum agendamento existe ainda** e o horário continua
   disponível para outras clientes.
2. O provedor confirma → o backend cria o agendamento, com
   `paymentMethod = pix|card` e `paymentStatus = paid`, e avisa a cliente.
3. Se outra cliente pegou o horário nesse meio-tempo, a cobrança fica
   `failed / slot_taken`, a cliente é avisada na tela e por notificação, e **a
   devolução é manual**: o app não estorna sozinho. Estorne em
   Atividade → o pagamento → Devolver, no painel do Mercado Pago.

"Pagar no salão" não passa por cobrança: o agendamento é criado na hora com
`paymentStatus = pending`, e aparece no painel como "a receber".

### Pontos que valem saber

- O valor cobrado é conferido contra o valor da cobrança na hora de confirmar;
  divergência marca `failed / amount_mismatch` e não vira agendamento.
- Webhook repetido não cria agendamento duplicado (a confirmação é idempotente).
- Cobrança pix expira em `PIX_EXPIRATION_MINUTES`; depois disso a cliente
  recomeça a escolha.
- O cartão é cobrado em 1 parcela, e boleto/transferência estão desabilitados
  de propósito: não servem para reservar horário (levam dias para compensar).
