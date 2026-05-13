import jwt from "jsonwebtoken";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import logger from "../utils/logger.js";

/**
 * @desc    Refresh the access token using the refresh token cookie
 * @route   POST /api/v1/auth/refresh
 * @access  Public (requires valid refresh token cookie)
 */
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid token type" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account banned" });
    }

    // Rotate: issue new access + refresh tokens
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    });
  } catch (error) {
    logger.error("Refresh token error", { message: error.message });
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};
