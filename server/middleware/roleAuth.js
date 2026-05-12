/**
 * Role-based and permission-based authorization middleware
 */

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

// Update last active timestamp
export const updateLastActive = (req, res, next) => {
  if (req.user) {
    req.user.lastActiveAt = new Date();
  }
  next();
};
