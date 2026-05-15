/**
 * Role-based and permission-based authorization middleware
 */
import logger from "../utils/logger.js";

// Check if user has specific role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user" });
    }

    if (req.user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    if (req.user.role && roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: "Not authorized, insufficient role",
      requiredRole: roles,
      userRole: req.user.role,
    });
  };
};

// Check if user has specific permission
export const permission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user" });
    }

    if (req.user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some((p) => req.user.permissions?.includes(p));

    if (hasPermission) {
      return next();
    }

    return res.status(403).json({
      message: "Not authorized, insufficient permissions",
      requiredPermissions: permissions,
      userPermissions: req.user.permissions || [],
    });
  };
};

// Ensure user is admin
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no user" });
  }

  if (req.user.isBanned) {
    return res.status(403).json({ message: "Your account has been banned" });
  }

  if (req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({ message: "Admin access required" });
};

// Ensure user is moderator or above
export const moderatorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, no user" });
  }

  if (req.user.isBanned) {
    return res.status(403).json({ message: "Your account has been banned" });
  }

  if (req.user.role === "admin" || req.user.role === "moderator") {
    return next();
  }

  return res.status(403).json({ message: "Moderator access required" });
};

// Update last active timestamp — debounced to avoid a DB write on every request.
// Only updates if at least 5 minutes have passed since the last tracked update.
const _lastActiveCache = new Map();
const LAST_ACTIVE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const updateLastActive = (req, res, next) => {
  if (req.user) {
    const userId = req.user._id.toString();
    const now = Date.now();
    const lastUpdated = _lastActiveCache.get(userId) || 0;

    if (now - lastUpdated > LAST_ACTIVE_INTERVAL_MS) {
      _lastActiveCache.set(userId, now);
      // Fire-and-forget — don't block the request
      import("../models/User.js").then(({ default: User }) => {
        User.findByIdAndUpdate(userId, { lastActiveAt: new Date() }).catch(() => {});
      });
    }
  }
  next();
};

