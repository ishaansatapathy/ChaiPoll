import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";
import logger from "../utils/logger.js";

/**
 * @desc    Get all users (with pagination)
 * @route   GET /api/admin/users
 * @access  Admin only
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(limit).sort("-createdAt"),
      User.countDocuments(),
    ]);

    res.json({
      data: users,
      pagination: { page, limit, total, hasMore: skip + users.length < total },
    });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error fetching users" });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Admin only
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error fetching user" });
  }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Admin only
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "moderator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing your own role
    if (user._id.toString() === req.user._id.toString() && role !== user.role) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error updating user role" });
  }
};

/**
 * @desc    Grant permission to user
 * @route   PATCH /api/admin/users/:id/permissions/grant
 * @access  Admin only
 */
export const grantPermission = async (req, res) => {
  try {
    const { permission } = req.body;

    const validPermissions = [
      "manage_polls",
      "moderate_polls",
      "view_analytics",
      "manage_users",
      "ban_users",
      "delete_content",
      "system_settings",
      "view_admin_dashboard",
    ];

    if (!validPermissions.includes(permission)) {
      return res.status(400).json({ message: "Invalid permission" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.permissions.includes(permission)) {
      user.permissions.push(permission);
      await user.save();
    }

    res.json({ message: "Permission granted", user });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error granting permission" });
  }
};

/**
 * @desc    Revoke permission from user
 * @route   PATCH /api/admin/users/:id/permissions/revoke
 * @access  Admin only
 */
export const revokePermission = async (req, res) => {
  try {
    const { permission } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.permissions = user.permissions.filter((p) => p !== permission);
    await user.save();

    res.json({ message: "Permission revoked", user });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error revoking permission" });
  }
};

/**
 * @desc    Ban a user
 * @route   PATCH /api/admin/users/:id/ban
 * @access  Admin only
 */
export const banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot ban yourself" });
    }

    user.isBanned = true;
    user.banReason = reason || "No reason provided";
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;
    await user.save();

    res.json({ message: "User banned successfully", user });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error banning user" });
  }
};

/**
 * @desc    Unban a user
 * @route   PATCH /api/admin/users/:id/unban
 * @access  Admin only
 */
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBanned = false;
    user.banReason = null;
    user.bannedAt = null;
    user.bannedBy = null;
    await user.save();

    res.json({ message: "User unbanned successfully", user });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error unbanning user" });
  }
};

/**
 * @desc    Get all polls (with pagination and filtering)
 * @route   GET /api/admin/polls
 * @access  Admin/Moderator
 */
export const getAllPolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      Poll.find()
        .populate("createdBy", "name email avatar")
        .skip(skip)
        .limit(limit)
        .sort("-createdAt"),
      Poll.countDocuments(),
    ]);

    res.json({
      data: polls,
      pagination: { page, limit, total, hasMore: skip + polls.length < total },
    });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error fetching polls" });
  }
};

/**
 * @desc    Flag a poll for review/moderation
 * @route   PATCH /api/admin/polls/:id/flag
 * @access  Admin/Moderator
 */
export const flagPoll = async (req, res) => {
  try {
    const { reason } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!poll.flagged) {
      poll.flagged = true;
      poll.flagReason = reason || "No reason provided";
      poll.flaggedAt = new Date();
      poll.flaggedBy = req.user._id;
      await poll.save();
    }

    res.json({ message: "Poll flagged successfully", poll });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error flagging poll" });
  }
};

/**
 * @desc    Unflag a poll
 * @route   PATCH /api/admin/polls/:id/unflag
 * @access  Admin only
 */
export const unflagPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.flagged = false;
    poll.flagReason = null;
    poll.flaggedAt = null;
    poll.flaggedBy = null;
    await poll.save();

    res.json({ message: "Poll unflagged successfully", poll });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error unflagging poll" });
  }
};

/**
 * @desc    Delete a poll (with all votes)
 * @route   DELETE /api/admin/polls/:id
 * @access  Admin only
 */
export const deletePollAdmin = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    await Vote.deleteMany({ pollId: poll._id });
    await Poll.findByIdAndDelete(poll._id);

    res.json({ message: "Poll deleted successfully by admin" });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error deleting poll" });
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin only
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalPolls, totalVotes, bannedUsers, flaggedPolls] = await Promise.all([
      User.countDocuments(),
      Poll.countDocuments(),
      Vote.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Poll.countDocuments({ flagged: true }),
    ]);

    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    const pollsByVisibility = await Poll.aggregate([
      {
        $group: {
          _id: "$visibility",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentPollsCreated = await Poll.find()
      .sort("-createdAt")
      .limit(5)
      .populate("createdBy", "name email");

    const activeUsers = await User.find().sort("-lastActiveAt").limit(10).select("-password");

    res.json({
      summary: {
        totalUsers,
        totalPolls,
        totalVotes,
        bannedUsers,
        flaggedPolls,
      },
      usersByRole: usersByRole.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      pollsByVisibility: pollsByVisibility.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      recentPollsCreated,
      activeUsers,
    });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

/**
 * @desc    Get activity logs (recent admin actions)
 * @route   GET /api/admin/logs
 * @access  Admin only
 */
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    // Get recently banned users
    const bannedUsers = await User.find({ isBanned: true })
      .select("-password")
      .sort("-bannedAt")
      .limit(limit);

    // Get flagged polls
    const flaggedPolls = await Poll.find({ flagged: true })
      .sort("-flaggedAt")
      .limit(limit);

    res.json({
      recentBans: bannedUsers,
      recentFlags: flaggedPolls,
    });
  } catch (error) {
    logger.error("Admin controller error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error fetching logs" });
  }
};
