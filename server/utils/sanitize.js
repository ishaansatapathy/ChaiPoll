/**
 * Lightweight text sanitizer — strips HTML tags and common XSS vectors
 * without adding an external dependency.
 *
 * For user-provided text fields (poll titles, question text, option text).
 * This does NOT replace proper output encoding (React handles that on the
 * frontend), but protects server-rendered contexts such as email templates.
 */

const TAG_RE = /<\/?[^>]+(>|$)/g;
const SCRIPT_RE = /javascript\s*:/gi;
const EVENT_RE = /\bon\w+\s*=/gi;

/**
 * Sanitize a plain-text string by stripping HTML tags and dangerous patterns.
 * Returns the cleaned string, or an empty string for falsy input.
 */
export function sanitizeText(input) {
  if (!input) return "";
  return String(input)
    .replace(TAG_RE, "")
    .replace(SCRIPT_RE, "")
    .replace(EVENT_RE, "")
    .trim();
}
