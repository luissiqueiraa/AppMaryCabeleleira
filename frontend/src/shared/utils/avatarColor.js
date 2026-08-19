const PALETTE = [
  { from: "#f2a8cd", to: "#d6336c" },
  { from: "#caa3d8", to: "#6b3f86" },
  { from: "#9c6f9e", to: "#4a2c4f" },
  { from: "#f9c9de", to: "#e8a0c0" },
  { from: "#e9d8c3", to: "#a07b52" },
  { from: "#f6b6c6", to: "#e487a4" },
];

// Hash determinístico id -> par de cores, para quem ainda não tem foto real.
export function avatarColorFor(id) {
  const hash = String(id)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}
