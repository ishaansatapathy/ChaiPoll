import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { submitVote } from "../controllers/voteController.js";
import { voteValidationRules, validate } from "../middleware/validator.js";

const router = express.Router();

// Optional auth middleware for voting (to assign voterId if logged in, but not block if not)
const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.jwt;
  if (token) {
    try {
      // Verify access token (short-lived) with JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    } catch {
      // Token invalid/expired — continue as anonymous voter
    }
  }
  next();
};

router.post("/", optionalAuth, voteValidationRules, validate, submitVote);

export default router;
