export function isPasswordValid(password) {
  return password.length > 6;
}

// Sem regras de complexidade — a "força" aqui reflete só o tamanho.
export function getPasswordScore(password) {
  const length = password.length;
  if (length < 7) return 1;
  if (length < 10) return 2;
  if (length < 12) return 3;
  if (length < 14) return 4;
  return 5;
}
