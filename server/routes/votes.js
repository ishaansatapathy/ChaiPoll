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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
    } catch {
      // Ignore token errors for optional auth
    }
  }
  next();
};

router.post("/", optionalAuth, voteValidationRules, validate, submitVote);

export default router;
