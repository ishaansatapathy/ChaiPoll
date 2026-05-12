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

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// User Management
router.route("/users").get(getAllUsers);
router.route("/users/:id").get(getUserById);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/permissions/grant", grantPermission);
router.patch("/users/:id/permissions/revoke", revokePermission);
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

// Poll Management
router.route("/polls").get(getAllPolls);
router.patch("/polls/:id/flag", moderatorOnly, flagPoll);
router.patch("/polls/:id/unflag", unflagPoll);
router.delete("/polls/:id", deletePollAdmin);

// Dashboard & Analytics
router.get("/stats", getDashboardStats);
router.get("/logs", getActivityLogs);

export default router;
