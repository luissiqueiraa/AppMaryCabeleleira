import * as usersService from "../services/users.service.js";

// GET /users — lista paginada de usuários para a administração (exige a
// permission manage_users). Os filtros e a paginação vêm da query string e são
// repassados ao service; a resposta separa os itens do bloco de paginação.
export async function listUsers(req, res, next) {
  try {
    const result = await usersService.listUsers(req.query);
    res.status(200).json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
}

// GET /users/:id — detalhe de um usuário. A rota usa authorizeOwnership: a
// pessoa vê os próprios dados, e quem tem manage_users vê os de qualquer um.
export async function getUser(req, res, next) {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

// PATCH /users/:id/roles — troca a role de um usuário (promover a admin, etc).
// Passa o req.user adiante porque o service precisa saber quem está pedindo
// para aplicar as travas: ninguém altera o owner e só o owner cria outro admin.
export async function assignRole(req, res, next) {
  try {
    const user = await usersService.assignUserRole(req.params.id, req.body.roleId, req.user, req);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}
