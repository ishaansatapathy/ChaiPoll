/**
 * JWT cookie flags for dev (http://localhost) vs prod (cross-origin HTTPS).
 *
 * Production default: SameSite=None + Secure (API and client on different sites).
 * Override with JWT_COOKIE_SAMESITE=lax|none|strict and JWT_COOKIE_SECURE=true|false.
 */
export function getJwtCookieOptions() {
  const explicitSame = process.env.JWT_COOKIE_SAMESITE?.toLowerCase();
  const sameSite =
    explicitSame === "none" || explicitSame === "lax" || explicitSame === "strict"
      ? explicitSame
      : process.env.NODE_ENV === "production"
        ? "none"
        : "lax";

  let secure;
  if (process.env.JWT_COOKIE_SECURE === "true") secure = true;
  else if (process.env.JWT_COOKIE_SECURE === "false") secure = false;
  else secure = sameSite === "none" ? true : process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

/** Options that must match getJwtCookieOptions() so the browser clears the cookie. */
export function getClearJwtCookieOptions() {
  const { sameSite, secure } = getJwtCookieOptions();
  return {
    httpOnly: true,
    sameSite,
    secure,
    expires: new Date(0),
    path: "/",
  };
}
