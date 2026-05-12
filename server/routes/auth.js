import express from "express";
import passport from "passport";
import { protect } from "../middleware/auth.js";
import { authCredentialLimiter, passwordResetLimiter } from "../middleware/rateLimiters.js";
import {
  signupValidationRules,
  loginValidationRules,
  forgotPasswordValidationRules,
  verifyOtpValidationRules,
  resetPasswordValidationRules,
  updateDisplayNameValidationRules,
  validate,
} from "../middleware/validator.js";
import {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
  getMe,
  updateDisplayName,
  googleCallback,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authCredentialLimiter, signupValidationRules, validate, signup);
router.post("/login", authCredentialLimiter, loginValidationRules, validate, login);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPasswordValidationRules,
  validate,
  forgotPassword
);
router.post("/verify-otp", passwordResetLimiter, verifyOtpValidationRules, validate, verifyOtp);
router.post(
  "/reset-password",
  passwordResetLimiter,
  resetPasswordValidationRules,
  validate,
  resetPassword
);
router.post("/logout", logout);

router.get("/me", protect, getMe);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login`,
    session: false,
  }),
  googleCallback
);

router.patch(
  "/update-display-name",
  protect,
  updateDisplayNameValidationRules,
  validate,
  updateDisplayName
);

export default router;
