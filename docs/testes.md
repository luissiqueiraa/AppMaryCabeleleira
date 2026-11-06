# Testes

Jest nos dois lados. Os dois projetos são ESM (`"type": "module"`), então o Jest
roda sem Babel — por isso o script de teste chama o Jest com
`--experimental-vm-modules`, e não `jest` direto.

## Rodar

**Backend** (dentro do container, onde fica o `node_modules`):

```bash
docker exec marycabelo_api npm test                  # tudo
docker exec marycabelo_api npm run test:unit         # só unidade (sem banco)
docker exec marycabelo_api npm run test:integration  # só integração (precisa de banco)
docker exec marycabelo_api npm test -- --coverage     # com cobertura
```

**Frontend** (na máquina, onde o `node_modules` está):

```bash
cd frontend
npm test
npm run test:watch
```

## O banco dos testes de integração

A suíte de integração usa Postgres de verdade, porque a garantia testada mora
no banco: a constraint `appointments_employee_no_overlap`, que impede duas
clientes no mesmo horário. Mock nenhum cobre isso.

Criar o banco de teste uma vez:

```bash
docker exec marycabelo_db psql -U postgres -c "CREATE DATABASE marycabelo_test;"
docker exec -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/marycabelo_test" \
  marycabelo_api npm run test:db:setup
```

Depois de criar novas migrações, repita o segundo comando para atualizar o banco
de teste.

Para apontar para outro banco, use `TEST_DATABASE_URL`. **Sem banco acessível a
suíte não falha**: ela avisa no console e passa, para `npm test` continuar
servindo em máquina sem Docker (e para o CI rodar só unidade, se você quiser).

Os testes de integração limpam o que criam (`beforeAll`/`afterAll`) e só tocam o
banco de teste — nunca o `marycabelo` de desenvolvimento.

As suítes rodam **em série** (`--runInBand`). Em paralelo, duas suítes de
integração compartilham o mesmo banco e a limpeza de uma apaga as linhas da
outra no meio do caminho — a falha é intermitente, o pior tipo. A suíte inteira
leva ~2s, então serializar não custa nada.

## O que está coberto

**Backend — unidade** (`backend/tests/unit`), com repositórios mockados:

- `prepareBooking.test.js` — soma de duração e preço de vários serviços,
  deduplicação, data no passado, fora do expediente, dia fechado, serviço
  inativo/inexistente, profissional inativa e a matriz de conflito de horário
  (mesmo horário, dentro do procedimento, encostando no início/fim)
- `payments.test.js` — confirmação de pagamento: aprovado cria agendamento,
  status vem do provedor e não do corpo do webhook, assinatura inválida,
  valor divergente, webhook repetido (idempotência), horário tomado durante o
  pagamento, cartão ligado pela referência externa, expiração e reconciliação
- `webhookSignature.test.js` — HMAC do webhook do Mercado Pago: assinatura
  correta, segredo errado, id trocado, timestamp trocado, cabeçalho malformado
- `validators.test.js` — contratos de entrada da API (serviços de 1 a 10,
  métodos de pagamento aceitos, senha mínima de 6, frase do reset)

**Backend — integração** (`backend/tests/integration`), com banco:

- `overlap.test.js` — o banco recusa sobreposição, aceita agendamento
  encostado, concluído continua ocupando, cancelado libera, **três gravações
  simultâneas e só uma entra**, e sobreposição atravessando a meia-noite (caso
  que a checagem em memória não pega, só a constraint)

**Frontend** (`frontend/tests`):

- `availability.test.js` — grade de 15 em 15 min, último horário do dia,
  bloqueio do intervalo ocupado, **bloqueio mesmo sem serviço escolhido**
  (regressão de um bug real: a grade mostrava o dia livre), serviço mais longo
  bloqueando mais cedo, horário encostado liberado, procedimento que passa do
  fechamento permitido, e horário que já passou quando o dia é hoje
- `mapAppointment.test.js` — resumo dos serviços em texto, fotos de cliente e
  profissional, horário no fuso do salão, preço, agendamento sem profissional

O fuso é fixado em `America/Sao_Paulo` (`frontend/tests/setup.js`): as regras do
salão são hora de parede, e um teste que passa aqui e falha no CI não serve de
rede de proteção.

## O que ainda não está coberto

- **Componentes React.** Exigiria Babel para JSX mais `jsdom` e
  `@testing-library/react`. A lógica que importa já está nos utilitários
  testados; se for cobrir tela, considere Vitest no frontend, que entende Vite
  sem configuração extra.
- **Rotas HTTP de ponta a ponta** (autenticação, permissões, upload). Hoje isso
  foi validado à mão; o caminho natural é `supertest` batendo no app Express
  com o banco de teste.
- **Conversa real com o Mercado Pago.** Os testes cobrem a nossa metade
  (o que fazemos com a resposta); a resposta em si é mockada.
