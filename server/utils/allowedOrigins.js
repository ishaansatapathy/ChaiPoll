/**
 * CORS + Socket.io allowed origins (Express `cors` + Socket.io `cors.origin`).
 *
 * Always merges: comma-separated ALLOWED_ORIGINS, CLIENT_URL, and local dev URLs.
 * This avoids a common footgun: ALLOWED_ORIGINS set on Render without the exact
 * Vercel URL used by the browser (Origin header), which previously dropped CLIENT_URL
 * entirely and caused CORS + Socket.io failures.
 *
 * Set CLIENT_URL to your live frontend, e.g. https://chai-poll.vercel.app (no typo vs hyphen).
 */
const LOCAL_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

function stripTrailingSlashes(url) {
  return url.replace(/\/+$/, "");
}

export function getAllowedOrigins() {
  const list = [];

  const fromAllowList = process.env.ALLOWED_ORIGINS?.trim();
  if (fromAllowList) {
    list.push(
      ...fromAllowList
        .split(",")
        .map((s) => stripTrailingSlashes(s.trim()))
        .filter(Boolean)
    );
  }

  const fromClient = process.env.CLIENT_URL?.trim();
  if (fromClient) {
    list.push(stripTrailingSlashes(fromClient));
  }

  list.push(...LOCAL_DEV_ORIGINS);

  return [...new Set(list.filter(Boolean))];
}
