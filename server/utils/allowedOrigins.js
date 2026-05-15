export function getAllowedOrigins() {
  const normalize = (url) => (url.endsWith("/") ? url.slice(0, -1) : url);
  const list = [];

  // Add from ALLOWED_ORIGINS
  const raw = process.env.ALLOWED_ORIGINS;
  if (raw && raw.trim()) {
    raw.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach(o => list.push(normalize(o)));
  }

  // Add from CLIENT_URL
  const fromClient = process.env.CLIENT_URL?.trim();
  if (fromClient) list.push(normalize(fromClient));

  // Add defaults for local development
  list.push("http://localhost:5173");
  list.push("http://localhost:5174");
  list.push("http://127.0.0.1:5173");
  list.push("http://127.0.0.1:5174");

  return [...new Set(list)];
}
