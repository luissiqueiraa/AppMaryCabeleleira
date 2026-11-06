# Dois alvos na mesma imagem: "dev" é o que o docker-compose usa na máquina
# (nodemon, código montado por volume) e "production" é o que o Railway
# constrói. O alvo de produção vem por último de propósito: sem --target, o
# Docker constrói o último estágio, que é o que o Railway faz.
FROM node:22-alpine AS base

# O engine do Prisma precisa do OpenSSL no Alpine. Sem isso o container sobe e
# quebra na primeira consulta, com erro de biblioteca faltando.
RUN apk add --no-cache openssl

# O Docker Desktop deste host não tem rota IPv6 de saída (ENETUNREACH). Sem
# isso, o postinstall "prisma generate" trava tentando baixar o engine via
# AAAA em vez de cair pro A record.
ENV NODE_OPTIONS=--dns-result-order=ipv4first

WORKDIR /app

# ---------------------------------------------------------------- desenvolvimento
FROM base AS dev

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# -------------------------------------------------------------------- produção
FROM base AS production

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# npm ci instala exatamente o que está no lockfile. As devDependencies ficam
# porque o CLI do Prisma é uma delas e roda a cada deploy, aplicando as
# migrações antes do servidor subir.
RUN npm ci && npm cache clean --force

COPY . .

# As pastas de upload precisam existir antes do primeiro envio. Em produção um
# volume é montado por cima de /app/uploads; sem volume, os arquivos somem a
# cada deploy.
RUN mkdir -p uploads/avatars uploads/logos

# A porta real vem da variável PORT do provedor; o EXPOSE é documentação.
EXPOSE 3000
CMD ["npm", "run", "start:migrate"]
