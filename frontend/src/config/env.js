export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",

  // Config do app web no Firebase (Console > Configurações do projeto > Seus
  // apps > Web). Estes valores são públicos por definição — quem autoriza o
  // acesso é a regra do Firebase e a verificação do ID token no backend.
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
};
