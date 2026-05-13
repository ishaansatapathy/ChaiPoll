import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";
import { getClearJwtCookieOptions } from "../utils/jwtCookieOptions.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Exact lowercase match first (indexed), then case-insensitive (legacy DB rows). */
async function findUserByEmailForRecovery(emailValue) {
  const trimmed = String(emailValue ?? "").trim();
  if (!trimmed) return null;
  const byLower = await User.findOne({ email: trimmed.toLowerCase() });
  if (byLower) return byLower;
  return User.findOne({
    email: { $regex: new RegExp(`^\\s*${escapeRegex(trimmed)}\\s*$`, "i") },
  });
}

function emailMatchClause(emailValue) {
  const trimmed = String(emailValue ?? "").trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  return {
    $or: [
      { email: lower },
      { email: { $regex: new RegExp(`^\\s*${escapeRegex(trimmed)}\\s*$`, "i") } },
    ],
  };
}

const GENERIC_RECOVERY_MESSAGE = "If an account exists for that email, we sent reset instructions.";

// @desc    Sign up
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name: name.trim(),
      email: sanitizedEmail,
      password,
    });

    if (user) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user.verificationToken = verificationToken;
      await user.save();

      const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: "Verify Your ChaiPoll Account",
        html: `<div style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444; font-size: 22px;">Welcome to ChaiPoll!</h1>
          <p style="color: #a1a1a1; margin-bottom: 24px;">Please verify your email address to unlock full features:</p>
          <a href="${verifyUrl}" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Verify Email Address</a>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">Or copy this link: ${verifyUrl}</p>
        </div>`,
        text: `Verify your account: ${verifyUrl}`
      });

      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Unable to create account. Please try again." });
  }
};

// @desc    Login
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail }).select("+password");
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to sign in. Please try again." });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email, method } = req.body;
  try {
    const user = await findUserByEmailForRecovery(email);
    if (!user) {
      return res.status(200).json({ message: GENERIC_RECOVERY_MESSAGE });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const otp = crypto.randomInt(100_000, 1_000_000).toString();

    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    if (method === "otp") {
      const otpPlain = `Your ChaiPoll password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, you can ignore this email.`;
      await sendEmail({
        email: user.email,
        subject: "Your ChaiPoll password reset code",
        html: `<div style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444; font-size: 22px;">Password reset</h1>
          <p style="color: #a1a1a1;">Your 6-digit verification code is:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.35em; margin: 24px 0;">${otp}</p>
          <p style="color: #a1a1a1; font-size: 14px;">Code again (plain): <strong style="color: #fff; letter-spacing: 0.2em;">${otp}</strong></p>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>`,
        text: otpPlain,
      });
    } else {
      const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;
      const magicLinkText = `Reset your ChaiPoll password:\n\n${resetUrl}\n\nThis link expires in 10 minutes.`;
      await sendEmail({
        email: user.email,
        subject: "Reset Your Password — ChaiPoll",
        html: `<div style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444; font-size: 22px;">Password reset</h1>
          <p style="color: #a1a1a1; margin-bottom: 24px;">Open this link to set a new password:</p>
          <p style="margin-bottom: 16px;"><a href="${resetUrl}" style="color: #60a5fa;">${resetUrl}</a></p>
          <p style="color: #666; font-size: 12px;">This link expires in 10 minutes.</p>
        </div>`,
        text: magicLinkText,
      });
    }
    res.status(200).json({ message: GENERIC_RECOVERY_MESSAGE });
    logger.info("Password reset email handed off to provider", {
      method,
      toDomain: user.email.includes("@") ? user.email.split("@")[1] : "unknown",
    });
  } catch (error) {
    logger.error("Email error", { message: error.message, stack: error.stack });
    res.status(500).json({ message: "Unable to send recovery email. Please try again later." });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const emailClause = emailMatchClause(email);
    if (!emailClause) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }
    const user = await User.findOne({
      ...emailClause,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired code." });
    res.status(200).json({ message: "Code verified successfully." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword, token } = req.body;
  try {
    const emailClause = emailMatchClause(email);
    if (!emailClause) {
      return res.status(400).json({ message: "Invalid or expired reset request." });
    }
    let query = { ...emailClause, resetPasswordExpire: { $gt: Date.now() } };
    if (otp) query.resetPasswordOTP = otp;
    else if (token) query.resetPasswordToken = token;

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "Invalid or expired reset request." });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Password reset failed. Please try again." });
  }
};

// @desc    Verify Email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = (req, res) => {
  const clearOpts = getClearJwtCookieOptions();
  res.cookie("jwt", "", clearOpts);
  res.cookie("jwt_refresh", "", { ...clearOpts, path: "/api" });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    displayName: req.user.displayName,
    isOnboarded: req.user.isOnboarded,
  });
};

// @desc    Resend Verification Email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: "Verify Your ChaiPoll Account",
      html: `<div style="font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
        <h1 style="color: #ef4444; font-size: 22px;">Verification Link Resent</h1>
        <p style="color: #a1a1a1; margin-bottom: 24px;">Please verify your email address to unlock full features:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Verify Email Address</a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">Or copy this link: ${verifyUrl}</p>
      </div>`,
      text: `Verify your account: ${verifyUrl}`
    });

    res.status(200).json({ message: "Verification email resent successfully!" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Failed to resend email. Please try again." });
  }
};

// @desc    Update Display Name / Onboarding
// @route   PATCH /api/auth/update-display-name
export const updateDisplayName = async (req, res) => {
  try {
    const { displayName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.displayName = displayName;
    user.isOnboarded = true;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      displayName: user.displayName,
      isOnboarded: user.isOnboarded,
    });
  } catch (error) {
    console.error("Update display name error:", error);
    res.status(500).json({ message: "Failed to update display name" });
  }
};

// @desc    Google OAuth callback handler
// @route   Used internally after passport.authenticate
export const googleCallback = (req, res) => {
  generateToken(res, req.user._id);
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard`);
};
