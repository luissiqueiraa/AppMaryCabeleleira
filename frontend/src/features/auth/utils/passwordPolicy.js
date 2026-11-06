// Cadastro público: só tamanho mínimo, nada de complexidade. O backend cobra
// a mesma regra em registerPasswordSchema.
export function isPasswordValid(password) {
  return password.length >= 6;
}
