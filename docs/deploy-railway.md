# Deploy no Railway

O projeto sobe em **três serviços** dentro de um mesmo projeto Railway:

| Serviço | O que é | Pasta |
|---|---|---|
| `Postgres` | banco gerenciado do Railway | — |
| `backend` | API Node + Prisma, em Docker | `backend/` |
| `frontend` | build do Vite servido por nginx | `frontend/` |

O plano **Hobby (US$ 5/mês)** é o mínimo viável: o Free dá só US$ 1/mês de
crédito e 500 MB de volume, que não sustentam Node + Postgres ligados o dia
todo.

---

## 1. Criar o projeto e o banco

1. Entre em <https://railway.com> e crie um projeto novo.
2. **+ New → Database → Add PostgreSQL**. O serviço sobe sozinho e já expõe a
   variável `DATABASE_URL`.

## 2. Serviço do backend

1. **+ New → GitHub Repo** e escolha este repositório.
2. Em **Settings** do serviço criado:
   - **Root Directory**: `backend`
   - **Build**: o Railway detecta o `Dockerfile` e constrói o último estágio,
     que é o de produção. Não é preciso configurar nada.
   - **Healthcheck Path**: já vem de `backend/railway.json` (`/api/v1/health`).
3. Em **Variables**, adicione:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
JWT_ACCESS_SECRET=<gere um segredo longo e aleatório>
JWT_ACCESS_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=7
BCRYPT_SALT_ROUNDS=12
SALON_TIME_ZONE=America/Sao_Paulo

# Endereço público do próprio backend (preencha depois do passo 3)
PUBLIC_API_URL=https://<backend>.up.railway.app
# Endereço do frontend, para o CORS (preencha depois do passo 5)
CORS_ORIGIN=https://<frontend>.up.railway.app

# Primeira conta de proprietária, criada pelo seed
OWNER_EMAIL=voce@seudominio.com
OWNER_PASSWORD=<senha forte>

# Firebase (login com Google) — do JSON da conta de serviço
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=""

# Mercado Pago — ver docs/pagamentos-mercado-pago.md
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
PIX_EXPIRATION_MINUTES=30
```

`${{Postgres.DATABASE_URL}}` é uma referência do Railway: ele resolve sozinho
para a URL do banco, inclusive se ela mudar. Não copie a string na mão.

**Não defina `PORT`** — o Railway injeta, e o app já lê `process.env.PORT`.

4. **Volume para os uploads** (obrigatório): no serviço do backend,
   **Settings → Volumes → Add Volume**, com **Mount path `/app/uploads`**.
   Sem isso, as fotos de perfil e a logo do salão somem a cada deploy, porque
   o sistema de arquivos do container é descartável.

## 3. Gerar o domínio do backend

**Settings → Networking → Generate Domain**. Copie a URL e preencha
`PUBLIC_API_URL` com ela. O serviço reinicia sozinho.

As migrações rodam automaticamente a cada deploy: o comando de start é
`prisma migrate deploy && node src/server.js`. Ele aplica só o que já está
versionado em `prisma/migrations` — nunca cria migração nova.

> **Atenção à extensão do Postgres.** A migração
> `20260923140000_prevent_overlapping_appointments` executa
> `CREATE EXTENSION IF NOT EXISTS btree_gist` — é ela que sustenta a regra que
> impede duas clientes no mesmo horário. O Postgres do Railway permite, mas
> confira o log do primeiro deploy: se a migração falhar, o deploy falha junto
> (o que é o comportamento certo — melhor não subir do que subir sem a trava).

## 4. Semear o banco (uma vez só)

O banco nasce vazio: sem funções, sem permissões e sem a conta de
proprietária. No serviço do backend, abra o terminal do Railway
(**⋮ → Terminal**, ou `railway run` pelo CLI) e rode:

```bash
npm run db:seed
```

Isso cria as funções (owner, admin, employee, client), as permissões, a conta
de `OWNER_EMAIL`/`OWNER_PASSWORD` e as configurações do salão com os horários
padrão. É idempotente: rodar de novo não duplica nada.

Depois entre no app com essa conta e **troque a senha**.

## 5. Serviço do frontend

1. **+ New → GitHub Repo**, o mesmo repositório.
2. **Settings → Root Directory**: `frontend`.
3. Em **Variables** (elas entram no build, não no runtime):

```env
VITE_API_URL=https://<backend>.up.railway.app/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Repare no sufixo **`/api`** na URL: é assim que o axios monta as chamadas.

4. **Settings → Networking → Generate Domain** e copie a URL para a variável
   `CORS_ORIGIN` do backend.

> Essas variáveis são lidas **durante o build**, porque o Vite as grava dentro
> do JavaScript gerado. Mudou alguma? É preciso **Redeploy** do frontend —
> reiniciar não adianta. Se a URL da API não funcionar depois de um deploy,
> é quase sempre isso.

## 6. Webhook do Mercado Pago

No painel do Mercado Pago, aponte o webhook para:

```
https://<backend>.up.railway.app/api/v1/payments/webhook
```

e copie a assinatura secreta para `MERCADOPAGO_WEBHOOK_SECRET`. Detalhes em
[pagamentos-mercado-pago.md](pagamentos-mercado-pago.md).

## 7. Conferir se subiu certo

```bash
# A API responde?
curl https://<backend>.up.railway.app/api/v1/health

# O conteúdo público da home chega?
curl https://<backend>.up.railway.app/api/v1/public/home
```

No navegador: abra o frontend, entre com a conta de proprietária, cadastre um
serviço e faça um agendamento de teste. Depois confira o painel.

---

## Domínio próprio

Em cada serviço, **Settings → Networking → Custom Domain**. O Railway mostra o
registro CNAME a criar no seu provedor de DNS. Ao trocar os domínios, atualize
`CORS_ORIGIN` (backend), `PUBLIC_API_URL` (backend), `VITE_API_URL` (frontend,
com redeploy) e a URL do webhook no Mercado Pago.

## O que acontece a cada `git push`

O Railway reconstrói e republica os serviços cujos arquivos mudaram. No
backend, as migrações pendentes são aplicadas antes de o servidor aceitar
tráfego; o healthcheck em `/api/v1/health` segura o tráfego até a aplicação
responder.

## Backup do banco

O Railway tem snapshots no serviço de Postgres, mas vale ter o seu:

```bash
railway run --service Postgres pg_dump -Fc > backup-$(date +%F).dump
```

Guarde fora do Railway. A base tem agendamentos e histórico financeiro — e a
exclusão de conta é soft delete, então os dados estão todos lá.

## Rodar a imagem de produção na sua máquina

Para reproduzir o que o Railway constrói, antes de subir:

```bash
docker build --target production -t marycabelo-api ./backend
docker build --build-arg VITE_API_URL=http://localhost:3000/api -t marycabelo-web ./frontend
docker run -p 8080:8080 marycabelo-web
```

O `docker-compose.yml` continua servindo o desenvolvimento: ele usa o alvo
`dev` do mesmo Dockerfile, com nodemon e o código montado por volume.
