import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ 
    message: 'Validation failed', 
    errors: errors.array().map(err => ({ field: err.param, message: err.msg })) 
  });
};

export const pollValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim().isLength({ max: 100 }),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('Each question must have at least 2 options'),
];

export const voteValidationRules = [
  body('pollCode').notEmpty().withMessage('Poll code is required').isLength({ min: 6, max: 6 }),
  body('responses').isArray({ min: 1 }).withMessage('At least one response is required'),
  body('responses.*.questionId').notEmpty().withMessage('Question ID is required'),
  body('responses.*.selectedOptionId').notEmpty().withMessage('Selected option ID is required'),
];
