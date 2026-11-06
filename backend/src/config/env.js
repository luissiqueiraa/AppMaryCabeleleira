import "dotenv/config";

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  refreshTokenExpiresInDays: Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || 7),

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),

  ownerEmail: process.env.OWNER_EMAIL,
  ownerPassword: process.env.OWNER_PASSWORD,

  // Mercado Pago. Sem accessToken o pagamento online fica desligado: a API
  // recusa pix/cartão e o app só oferece "pagar no salão" — nada de abrir um
  // checkout que não existe. publicApiUrl é o endereço público deste backend,
  // necessário porque o webhook vem de fora (localhost não serve).
  mercadoPago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    apiUrl: process.env.MERCADOPAGO_API_URL || "https://api.mercadopago.com",
  },
  publicApiUrl: process.env.PUBLIC_API_URL,

  // Minutos que uma cobrança pix fica válida. Curto de propósito: o horário
  // não está reservado nesse meio-tempo.
  pixExpirationMinutes: Number(process.env.PIX_EXPIRATION_MINUTES || 30),

  // O banco guarda scheduledAt em UTC, mas o horário de funcionamento em
  // SalonSettings é hora de parede do salão. Sem esse fuso as duas coisas não
  // se comparam (o container roda em UTC).
  salonTimeZone: process.env.SALON_TIME_ZONE || "America/Sao_Paulo",

  // Credenciais da service account do Firebase (Console > Configurações do
  // projeto > Contas de serviço > Gerar nova chave privada). A privateKey vem
  // do JSON com "\n" escapado — o .env guarda essa forma escapada e aqui ela
  // volta a ser quebra de linha de verdade, senão o PEM não é aceito.
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
};
