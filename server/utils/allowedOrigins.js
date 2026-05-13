
export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (raw && raw.trim()) {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const fromClient = process.env.CLIENT_URL?.trim();
  const list = [];
  if (fromClient) list.push(fromClient);

  list.push("http://localhost:5173");
  list.push("http://localhost:5174");
  list.push("http://127.0.0.1:5173");
  list.push("http://127.0.0.1:5174");
  return [...new Set(list)];
}
