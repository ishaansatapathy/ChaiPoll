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
  verifyEmail,
  logout,
  getMe,
  updateDisplayName,
  resendVerification,
  googleCallback,
  toggle2FA,
  verify2FA,
} from "../controllers/authController.js";
import { refreshAccessToken } from "../controllers/refreshController.js";

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
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);
router.post("/refresh", refreshAccessToken);
router.post("/verify-2fa", passwordResetLimiter, verify2FA);
router.post("/toggle-2fa", protect, toggle2FA);
router.post("/logout", logout);

router.get("/me", protect, getMe);

router.get("/google", (req, res, next) => {
  const returnTo = req.query.returnTo || "/dashboard";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: returnTo,
  })(req, res, next);
});
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
