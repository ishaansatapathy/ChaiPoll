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
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ name, email, password });
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
    const user = await User.findOne({ email }).select('+password');
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
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log(`[Discovery] Search for ${email}: ${user ? 'AGENT FOUND' : 'AGENT NOT FOUND'}`);
    if (!user) return res.status(404).json({ message: 'No agent found with that signal.' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetToken;
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    if (method === 'otp') {
      await sendEmail({
        email: user.email,
        subject: 'Identity Verification Code',
        html: `<div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444;">Mission Recovery</h1>
          <p>Your 6-digit identity decode sequence is:</p>
          <div style="font-size: 40px; font-weight: bold; letter-spacing: 10px;">${otp}</div>
        </div>`
      });
    } else {
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Identity Restoration Link',
        html: `<div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px;">
          <h1 style="color: #ef4444;">Mission Recovery</h1>
          <a href="${resetUrl}" style="background: #fff; color: #000; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">RESTORE IDENTITY</a>
        </div>`
      });
    }
    res.status(200).json({ message: 'Recovery signal dispatched.' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: `Signal failure: ${error.message}` });
  }
});

// @desc    Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email, resetPasswordOTP: otp, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code.' });
    res.status(200).json({ message: 'Code authorized.' });
  } catch (error) {
    res.status(500).json({ message: 'Verification error.' });
  }
});

// @desc    Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword, token } = req.body;
  try {
    let query = { email };
    if (otp) query.resetPasswordOTP = otp;
    else if (token) query.resetPasswordToken = token;
    query.resetPasswordExpire = { $gt: Date.now() };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: 'Recovery protocol failed.' });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Identity restored.' });
  } catch (error) {
    res.status(500).json({ message: 'Restoration failure.' });
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
    callsign: req.user.callsign,
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

// @desc    Update Callsign/Onboarding
// @route   PATCH /api/auth/update-callsign
// @access  Private
router.patch('/update-callsign', protect, async (req, res) => {
  try {
    const { callsign } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ message: 'Agent not found' });
    
    user.callsign = callsign;
    user.isOnboarded = true;
    await user.save();
    
    res.json({ _id: user._id, name: user.name, email: user.email, avatar: user.avatar, callsign: user.callsign, isOnboarded: user.isOnboarded });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update callsign' });
  }
});

export default router;
