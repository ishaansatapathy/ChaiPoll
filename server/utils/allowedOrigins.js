/**
 * CORS + Socket.io origins from env.
 * Set ALLOWED_ORIGINS="http://localhost:5173,https://myapp.vercel.app"
 * or rely on CLIENT_URL (plus localhost for local dev).
 */
export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (raw && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const fromClient = process.env.CLIENT_URL?.trim();
  const list = [];
  if (fromClient) list.push(fromClient);
  // Sensible local default when ALLOWED_ORIGINS is unset
  list.push('http://localhost:5173');
  return [...new Set(list)];
}
