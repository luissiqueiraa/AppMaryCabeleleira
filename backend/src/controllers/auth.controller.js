import { env } from "../config/env.js";
import * as authService from "../services/auth.service.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/v1/auth";

// Grava o refresh token num cookie httpOnly: o JavaScript da página não
// consegue lê-lo, o que protege contra XSS. O path restrito faz o navegador só
// enviá-lo para as rotas de auth, e não em toda requisição à API.
function setRefreshTokenCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: env.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
  });
}

// Apaga o cookie do refresh token (logout ou refresh que falhou). O path
// precisa ser o mesmo usado na gravação, senão o navegador ignora.
function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

// POST /auth/register — cria a conta da cliente (sempre com a role client).
// Responde 201 só com os dados do usuário: cadastrar não loga automaticamente,
// a pessoa ainda passa pela tela de login.
export async function register(req, res, next) {
  try {
    const user = await authService.register(req.body, req);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// POST /auth/login — autentica por email e senha e abre a sessão. O access
// token volta no corpo (o frontend guarda em memória) e o refresh token vai no
// cookie httpOnly; os dois nunca trafegam pelo mesmo canal.
export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body, req);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
}

// POST /auth/google — login com Google. Recebe o ID token gerado pelo Firebase
// no popup do frontend; o service confere esse token e cria ou vincula a conta.
// Daqui em diante a sessão é a nossa mesma (JWT + cookie), igual ao login comum.
export async function googleLogin(req, res, next) {
  try {
    const { user, accessToken, refreshToken } = await authService.loginWithGoogle(
      req.body.idToken,
      req
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    next(error);
  }
}

// POST /auth/refresh-token — renova o access token expirado usando o cookie.
// O refresh token é rotacionado a cada uso (o antigo é revogado), então em caso
// de erro o cookie é limpo para não deixar um token morto preso no navegador.
export async function refreshToken(req, res, next) {
  try {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, accessToken, refreshToken: newRefreshToken } = await authService.refresh(
      incomingToken,
      req
    );
    setRefreshTokenCookie(res, newRefreshToken);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

// POST /auth/logout — encerra a sessão atual: revoga o refresh token no banco e
// apaga o cookie. As outras sessões da pessoa (outro navegador) continuam.
export async function logout(req, res, next) {
  try {
    const incomingToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.logout(incomingToken, req);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
}

// POST /auth/logout-all — derruba todas as sessões da usuária de uma vez, em
// qualquer dispositivo. É a saída para quando se suspeita de conta invadida.
export async function logoutAll(req, res, next) {
  try {
    await authService.logoutAll(req.user.id, req);
    clearRefreshTokenCookie(res);
    res.status(200).json({ success: true, data: { message: "All sessions were revoked" } });
  } catch (error) {
    next(error);
  }
}

// GET /auth/me — dados da usuária logada, incluindo as permissions atuais
// lidas do banco. É o que o frontend usa para montar menus e telas por papel.
export async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// PATCH /auth/me/avatar — troca a foto de perfil. O arquivo já chegou aqui
// validado e salvo em disco pelo middleware de upload (multer); o que se grava
// no banco é só o caminho dele.
export async function updateMyAvatar(req, res, next) {
  try {
    const user = await authService.updateAvatar(req.user.id, req.file.filename, req);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// PATCH /auth/me — a própria usuária edita seu cadastro (nome, email, telefone,
// preferência de lembretes). Não passa por aqui troca de senha nem de papel.
export async function updateMe(req, res, next) {
  try {
    const user = await authService.updateMe(req.user.id, req.body, req);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// POST /auth/me/change-password — troca a senha exigindo a senha atual. O
// service revoga todas as sessões depois de trocar, então é preciso entrar de
// novo (e quem tem conta só do Google não pode usar esta rota).
export async function changeMyPassword(req, res, next) {
  try {
    const result = await authService.changeMyPassword(req.user.id, req.body, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// DELETE /auth/me — a usuária exclui a própria conta. É exclusão lógica: o
// registro fica no banco (preservando o histórico de agendamentos), mas some
// das listagens e não consegue mais logar.
export async function deleteMe(req, res, next) {
  try {
    const result = await authService.deleteMe(req.user.id, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// POST /auth/forgot-password — inicia a redefinição de senha gerando um token
// temporário. Responde sempre igual, existindo a conta ou não, para não
// permitir descobrir quais emails estão cadastrados.
export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.email, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// POST /auth/reset-password — conclui a redefinição: valida o token do link,
// grava a senha nova e invalida o token (uso único) junto com as sessões ativas.
export async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
