FROM node:22-alpine

# O Docker Desktop deste host não tem rota IPv6 de saída (ENETUNREACH). Sem
# isso, o postinstall "prisma generate" trava tentando baixar o engine via
# AAAA em vez de cair pro A record.
ENV NODE_OPTIONS=--dns-result-order=ipv4first

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
