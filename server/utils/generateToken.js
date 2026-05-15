import jwt from "jsonwebtoken";
import { getJwtCookieOptions } from "./jwtCookieOptions.js";

const generateToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Refresh tokens are signed with a separate secret so a compromised access
  // token secret cannot be used to forge refresh tokens.
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshToken = jwt.sign({ userId, type: "refresh" }, refreshSecret, {
    expiresIn: "30d",
  });

  const baseOpts = getJwtCookieOptions();

  // Access token — short maxAge
  res.cookie("jwt", accessToken, {
    ...baseOpts,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token — long maxAge
  res.cookie("jwt_refresh", refreshToken, {
    ...baseOpts,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/", // Use root path to ensure maximum compatibility across subpaths
  });
};

export default generateToken;
