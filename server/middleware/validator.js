import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({
    message: "Validation failed",
    errors: errors.array().map((err) => ({ field: err.param, message: err.msg })),
  });
};

export const pollValidationRules = [
  body("title").notEmpty().withMessage("Title is required").trim().isLength({ max: 100 }),
  body("questions").isArray({ min: 1 }).withMessage("At least one question is required"),
  body("questions.*.text").notEmpty().withMessage("Question text is required"),
  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Each question must have at least 2 options"),
  body("questions.*.options.*")
    .isString()
    .trim()
    .notEmpty()
    .isLength({ max: 200 })
    .withMessage("Each option must be a non-empty string"),
];

export const voteValidationRules = [
  body("pollCode").notEmpty().withMessage("Poll code is required").isLength({ min: 6, max: 6 }),
  body("responses").isArray({ min: 1 }).withMessage("At least one response is required"),
  body("responses.*.questionId").notEmpty().withMessage("Question ID is required"),
  // Accept either optionIds (array) or selectedOptionId (string) — at least one must be present
  body("responses.*.optionIds").optional().isArray({ min: 1 }).withMessage("optionIds must be a non-empty array"),
  body("responses.*.selectedOptionId").optional().isString(),
  body("responses").custom((responses) => {
    for (const r of responses) {
      const hasOptionIds = Array.isArray(r.optionIds) && r.optionIds.length > 0;
      const hasSelectedId = typeof r.selectedOptionId === "string" && r.selectedOptionId.length > 0;
      if (!hasOptionIds && !hasSelectedId) {
        throw new Error("Each response must have optionIds or selectedOptionId");
      }
    }
    return true;
  }),
];

export const signupValidationRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 8, max: 128 }).withMessage("Password must be 8–128 characters"),
];

export const loginValidationRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidationRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("method").isIn(["otp", "link"]).withMessage("method must be otp or link"),
];

export const verifyOtpValidationRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("otp").isLength({ min: 6, max: 6 }).isNumeric().withMessage("OTP must be 6 digits"),
];

export const resetPasswordValidationRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("newPassword")
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be 8–128 characters"),
  body("otp").optional().isLength({ min: 6, max: 6 }).isNumeric(),
  body("token").optional().isString().isLength({ min: 20, max: 64 }),
  body().custom((_, { req }) => {
    if (!req.body.otp && !req.body.token) {
      throw new Error("Either otp or token is required");
    }
    return true;
  }),
];

export const updateDisplayNameValidationRules = [
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ max: 80 }),
];
