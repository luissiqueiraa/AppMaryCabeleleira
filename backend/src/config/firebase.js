// API modular do firebase-admin (v10+). O default export ("import admin from
// 'firebase-admin'") não expõe admin.apps em ESM no v14 — usar os sub-módulos
// é o caminho suportado.
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "./env.js";

let authClient = null;

export function isFirebaseConfigured() {
  return Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey);
}

// Inicialização preguiçosa: sem as credenciais o app sobe normalmente e só a
// rota de login com Google responde 503 — nada de derrubar o servidor inteiro
// por causa de um recurso opcional.
export function getFirebaseAuth() {
  if (authClient) return authClient;

  if (!isFirebaseConfigured()) {
    return null;
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
      });

  authClient = getAuth(app);
  return authClient;
}
