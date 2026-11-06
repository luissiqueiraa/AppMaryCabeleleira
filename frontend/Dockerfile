# Build do Vite e, depois, nginx servindo os arquivos estáticos. O resultado
# é uma imagem pequena, sem Node em produção.
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Tudo que começa com VITE_ entra no pacote em tempo de BUILD — o Vite
# substitui import.meta.env no código gerado. Trocar qualquer uma destas exige
# build novo; mudar a variável e reiniciar não surte efeito.
#
# As chaves do Firebase são públicas por natureza (vão para o navegador de
# qualquer forma); o que protege a conta são as regras do projeto no console
# do Google, não o sigilo delas.
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

RUN npm run build

# -------------------------------------------------------------------- produção
FROM nginx:alpine AS production

# A imagem oficial do nginx processa /etc/nginx/templates/*.template com
# envsubst ao subir, trocando ${PORT} pela porta que o provedor injeta. Só
# variáveis de ambiente de verdade são substituídas, então $uri da config
# sobrevive intacto.
ENV PORT=8080

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
