/**
 * CSRF protection for cookie-based SPA authentication.
 *
 * Since we use HTTP-only cookies for JWT, we need CSRF protection.
 * This middleware checks for a custom header (X-Requested-With) that
 * browsers will not include in cross-origin requests unless the server
 * explicitly allows it via CORS. Combined with our strict CORS config,
 * this prevents cross-site request forgery.
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt since they should be
 * side-effect free.
 */
export const csrfProtect = (req, res, next) => {
  // Skip safe methods
  const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (safeMethod) return next();

  // Skip if no cookie-based auth (e.g. no JWT cookie present)
  if (!req.cookies?.jwt && !req.cookies?.jwt_refresh) return next();

  // Require the custom header for state-changing requests with cookies
  const hasCustomHeader = req.headers["x-requested-with"] === "XMLHttpRequest" ||
                          req.headers["x-requested-with"] === "fetch";

  if (!hasCustomHeader) {
    // Also allow if Content-Type is application/json (browsers can't send
    // cross-origin JSON with cookies without CORS preflight)
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("application/json")) {
      return next();
    }

    return res.status(403).json({
      message: "CSRF validation failed. Missing required headers.",
    });
  }

  next();
};
