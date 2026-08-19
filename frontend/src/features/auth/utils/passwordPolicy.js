export function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password) {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

export function getPasswordScore(password) {
  return Object.values(getPasswordChecks(password)).filter(Boolean).length;
}
