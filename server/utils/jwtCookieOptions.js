export function getJwtCookieOptions() {
  const explicitSame = process.env.JWT_COOKIE_SAMESITE?.toLowerCase();
  const sameSite =
    explicitSame === "none" || explicitSame === "lax" || explicitSame === "strict"
      ? explicitSame
      : process.env.NODE_ENV === "production" || process.env.JWT_COOKIE_SAMESITE === "none"
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
