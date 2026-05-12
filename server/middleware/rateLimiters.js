import rateLimit from 'express-rate-limit';

const skipInTests = () => process.env.VITEST === 'true';

/** Login / signup brute-force protection */
export const authCredentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login or signup attempts. Try again later.' },
});

/** Forgot password, OTP verify, reset — tight cap to slow enumeration and OTP guessing */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  skip: skipInTests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset attempts. Try again in an hour.' },
});
