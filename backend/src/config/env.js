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
