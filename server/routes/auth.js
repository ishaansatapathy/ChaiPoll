import express from 'express';
import passport from 'passport';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// @desc    Sign up
// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name: name.trim(), email: sanitizedEmail, password });
    if (user) {
      generateToken(res, user._id);
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Login
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail }).select('+password');
    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email, method } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    if (method === 'otp') {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Reset Code — ChaiPoll',
        html: `<div style="font-family: 'Inter', sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444; font-size: 24px;">Password Reset</h1>
          <p style="color: #a1a1a1;">Your 6-digit verification code is:</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px; margin: 20px 0;">${otp}</div>
          <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
        </div>`
      });
    } else {
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Reset Your Password — ChaiPoll',
        html: `<div style="font-family: 'Inter', sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444; font-size: 24px;">Password Reset</h1>
          <p style="color: #a1a1a1; margin-bottom: 24px;">Click the button below to reset your password.</p>
          <a href="${resetUrl}" style="background: #fff; color: #000; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">Reset Password</a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This link expires in 10 minutes.</p>
        </div>`
      });
    }
    res.status(200).json({ message: 'Recovery email sent successfully.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: `Failed to send email: ${error.message}` });
  }
});

// @desc    Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim(), resetPasswordOTP: otp, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' });
    res.status(200).json({ message: 'Code verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Verification error.' });
  }
});

// @desc    Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword, token } = req.body;
  try {
    let query = { email: email.toLowerCase().trim() };
    if (otp) query.resetPasswordOTP = otp;
    else if (token) query.resetPasswordToken = token;
    query.resetPasswordExpire = { $gt: Date.now() };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset request.' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed.' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('jwt', '', { 
    httpOnly: true, 
    expires: new Date(0),
    sameSite: 'none',
    secure: true
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', protect, async (req, res) => {
  res.status(200).json({ 
    _id: req.user._id, 
    name: req.user.name, 
    email: req.user.email, 
    avatar: req.user.avatar,
    displayName: req.user.callsign,
    isOnboarded: req.user.isOnboarded
  });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { 
  failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`, 
  session: false 
}), (req, res) => {
  generateToken(res, req.user._id);
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
});

// @desc    Update Display Name/Onboarding
// @route   PATCH /api/auth/update-callsign
// @access  Private
router.patch('/update-callsign', protect, async (req, res) => {
  try {
    const { callsign } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.callsign = callsign;
    user.isOnboarded = true;
    await user.save();
    
    res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, displayName: user.callsign, isOnboarded: user.isOnboarded });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update display name' });
  }
});

export default router;
