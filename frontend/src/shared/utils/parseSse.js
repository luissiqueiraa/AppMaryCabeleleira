// Um bloco SSE: linhas "event: x" e "data: {...}". Comentário (": ping") é o
// heartbeat do servidor e não vira evento.
export function parseSseBlock(block) {
  let event = "message";
  const data = [];
  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const sep = line.indexOf(":");
    const field = sep === -1 ? line : line.slice(0, sep);
    const value = sep === -1 ? "" : line.slice(sep + 1).replace(/^ /, "");
    if (field === "event") event = value;
    if (field === "data") data.push(value);
  }
  if (data.length === 0) return null;
  try {
    return { event, data: JSON.parse(data.join("\n")) };
  } catch {
    return null;
  }
}
