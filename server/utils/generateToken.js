import jwt from "jsonwebtoken";
import { getJwtCookieOptions } from "./jwtCookieOptions.js";

/**
 * Sets a short-lived access token and a long-lived refresh token in HTTP-only cookies.
 * Access token: 15 minutes — used for API authorization.
 * Refresh token: 30 days — used only to obtain a new access token.
 */
const generateToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const baseOpts = getJwtCookieOptions();

  // Access token — short maxAge
  res.cookie("jwt", accessToken, {
    ...baseOpts,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token — long maxAge, restricted path
  res.cookie("jwt_refresh", refreshToken, {
    ...baseOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api",
  });
};

export default generateToken;
