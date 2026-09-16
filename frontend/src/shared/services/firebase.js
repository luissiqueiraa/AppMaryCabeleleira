import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { ENV } from "../../config/env";

export function isGoogleAuthEnabled() {
  return Boolean(ENV.FIREBASE.apiKey && ENV.FIREBASE.projectId && ENV.FIREBASE.appId);
}

// Só inicializa quando alguém clica em "entrar com Google" — sem as variáveis
// de ambiente o restante do app (login por senha) continua funcionando.
function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(ENV.FIREBASE);
  return getAuth(app);
}

// Abre o popup do Google e devolve o ID token do Firebase. Quem valida esse
// token e cria/entra na conta é o nosso backend (POST /v1/auth/google).
export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  // Sempre mostra o seletor de contas em vez de reusar a última silenciosamente.
  provider.setCustomParameters({ prompt: "select_account" });

  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}
