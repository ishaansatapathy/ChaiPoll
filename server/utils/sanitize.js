const TAG_RE = /<\/?[^>]+(>|$)/g;
const SCRIPT_RE = /javascript\s*:/gi;
const EVENT_RE = /\bon\w+\s*=/gi;

export function sanitizeText(input) {
  if (!input) return "";
  return String(input)
    .replace(TAG_RE, "")
    .replace(SCRIPT_RE, "")
    .replace(EVENT_RE, "")
    .trim();
}
