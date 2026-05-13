import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly, moderatorOnly, permission } from "../middleware/roleAuth.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  grantPermission,
  revokePermission,
  banUser,
  unbanUser,
  getAllPolls,
  flagPoll,
  unflagPoll,
  deletePollAdmin,
  getDashboardStats,
  getActivityLogs,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// User Management
router.route("/users").get(adminOnly, getAllUsers);
router.route("/users/:id").get(adminOnly, getUserById);
router.patch("/users/:id/role", adminOnly, updateUserRole);
router.patch("/users/:id/permissions/grant", adminOnly, grantPermission);
router.patch("/users/:id/permissions/revoke", adminOnly, revokePermission);
router.patch("/users/:id/ban", adminOnly, banUser);
router.patch("/users/:id/unban", adminOnly, unbanUser);

// Poll Management
router.route("/polls").get(adminOnly, getAllPolls);
router.patch("/polls/:id/flag", moderatorOnly, flagPoll);
router.patch("/polls/:id/unflag", moderatorOnly, unflagPoll);
router.delete("/polls/:id", adminOnly, deletePollAdmin);

// Dashboard & Analytics
router.get("/stats", adminOnly, getDashboardStats);
router.get("/logs", adminOnly, getActivityLogs);

export default router;
