# MaryCabelo — Fundação do Projeto

Estrutura inicial (sem regras de negócio). Dois ambientes independentes: homepage institucional e sistema interno, ambos servidos pelo mesmo frontend React com layouts e rotas separadas.

## 1. Comandos de instalação

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install

# Banco de dados (Docker)
docker compose up -d postgres

# Backend via Docker (alternativa ao npm install local)
docker compose up -d backend
```

Copiar `.env.example` para `.env` em `frontend/` e `backend/` antes de rodar.

## 2. Estrutura de pastas — Frontend

```
frontend/src/
├── app/routes/        # AppRoutes, PrivateRoute
├── layouts/            # PublicLayout, AuthLayout, DashboardLayout
├── features/           # um diretório por domínio (pages/components)
│   ├── institutional/  # homepage
│   ├── auth/
│   ├── dashboard/
│   ├── appointments/
│   ├── clients/
│   ├── employees/
│   └── profile/
├── shared/
│   ├── components/  ├── hooks/  ├── services/ (axios)  ├── utils/  └── constants/ (roles)
└── config/             # env.js
```

## 3. Estrutura de pastas — Backend

```
backend/src/
├── routes/         # uma rota por entidade + index.js agregador
├── controllers/
├── services/
├── repositories/
├── middlewares/    # auth, rbac, errorHandler
├── validators/     # schemas Zod
├── config/         # env.js, database.js
├── utils/          # roles.js, AppError.js
├── app.js          # composição do Express
└── server.js       # bootstrap
```

Camadas por entidade: `auth`, `users`, `employees`, `clients`, `services`, `appointments`.

## 4. docker-compose.yml

Serviços: `postgres` (16-alpine, com `database/init.sql` montado em `docker-entrypoint-initdb.d`) e `backend` (build via `backend/Dockerfile`, depende do healthcheck do banco). Frontend roda fora do Compose em dev (`npm run dev`); pode receber serviço próprio depois (build estático + nginx).

## 5. Fluxo geral da arquitetura

```
[Browser]
   │
   ├─ "/"            → PublicLayout  → features/institutional   (homepage)
   ├─ "/login"        → AuthLayout    → features/auth
   └─ "/dashboard/*"  → PrivateRoute → DashboardLayout → features/{appointments,clients,employees,profile}
                                            │
                                       axios (shared/services/api.js)
                                            │
                                            ▼
                                  Express (routes → controllers → services → repositories)
                                            │
                                            ▼
                                       PostgreSQL (Docker)
```

RBAC: token JWT contém `role` (`admin` | `employee` | `client`); `auth.middleware` decodifica, `rbac.middleware` restringe rotas por papel.

## 6. Dependências

**Frontend:** react, react-dom, vite, tailwindcss + @tailwindcss/vite, axios, react-router-dom, react-icons.

**Backend:** express, zod, jsonwebtoken, bcryptjs, pg, dotenv, cors, helmet, morgan, cookie-parser; dev: nodemon.

**Infra:** docker, docker-compose, postgres:16-alpine.

## 7. Convenções de nomenclatura

- Componentes React: `PascalCase` (`DashboardLayout.jsx`).
- Hooks: `camelCase` com prefixo `use` (`useAuth.js`).
- Arquivos de backend por camada: `entidade.camada.js` (`appointments.service.js`).
- Rotas REST: plural, kebab-case quando composto (`/api/appointments`).
- Variáveis de ambiente: `UPPER_SNAKE_CASE`.
- Tabelas do banco: plural, snake_case (`appointments`, `services`).
- Branches/commits: `feat/`, `fix/`, `chore/` + descrição curta.

## 8. Ordem recomendada de desenvolvimento

1. Banco de dados: detalhar colunas das tabelas e relacionamentos (migrations).
2. Backend — `auth`: registro/login, hash de senha, emissão de JWT, middlewares de auth/RBAC.
3. Backend — `users`/`employees`/`clients`: CRUD básico.
4. Backend — `services` e `schedules`: catálogo de serviços e disponibilidade.
5. Backend — `appointments`: regras de agendamento (depende dos anteriores).
6. Frontend — Design System (botões, inputs, cards) sobre Tailwind.
7. Frontend — Homepage institucional (estática, sem auth).
8. Frontend — Auth (login) integrado ao backend.
9. Frontend — Dashboard e telas internas (appointments, clients, employees, profile), com RBAC nas rotas.
10. Integração final, testes manuais por perfil (admin/employee/client) e ajustes de responsividade.
