import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const protect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      return next();
    } catch (error) {
      // Access token expired — try refresh token
      const refreshToken = req.cookies.jwt_refresh;
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
          if (decoded.type === "refresh") {
            const user = await User.findById(decoded.userId).select("-password");
            if (user && !user.isBanned) {
              // Rotate tokens silently
              generateToken(res, user._id);
              req.user = user;
              return next();
            }
          }
        } catch {
          // Refresh token also invalid
        }
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // No access token — try refresh token
    const refreshToken = req.cookies.jwt_refresh;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (decoded.type === "refresh") {
          const user = await User.findById(decoded.userId).select("-password");
          if (user && !user.isBanned) {
            generateToken(res, user._id);
            req.user = user;
            return next();
          }
        }
      } catch {
        // Refresh token invalid
      }
    }
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const optionalProtect = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    } catch (error) {
      console.error("Optional Auth failed:", error.message);
    }
  }
  next();
};

export { protect, optionalProtect };
