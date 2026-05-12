/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       required:
 *         - title
 *         - questions
 *       properties:
 *         id:
 *           type: string
 *           description: Poll ID
 *         pollCode:
 *           type: string
 *           description: Unique poll code
 *         title:
 *           type: string
 *           description: Poll title
 *         description:
 *           type: string
 *           description: Poll description
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *         createdBy:
 *           type: string
 *           description: User ID of poll creator
 *         totalParticipants:
 *           type: number
 *           description: Total number of responses
 *         visibility:
 *           type: string
 *           enum: [public, private, unlisted]
 *         settings:
 *           type: object
 *           properties:
 *             anonymous:
 *               type: boolean
 *             isPublished:
 *               type: boolean
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Poll expiry time
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     Question:
 *       type: object
 *       required:
 *         - text
 *         - options
 *       properties:
 *         text:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               voteCount:
 *                 type: number
 *         isMandatory:
 *           type: boolean
 *         type:
 *           type: string
 *           enum: [single]
 *         totalVotes:
 *           type: number
 *
 *     Vote:
 *       type: object
 *       required:
 *         - pollCode
 *         - responses
 *       properties:
 *         pollCode:
 *           type: string
 *         responses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedOptionId:
 *                 type: string
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * /api/polls:
 *   get:
 *     tags:
 *       - Polls
 *     summary: Get all public polls
 *     responses:
 *       200:
 *         description: List of public polls
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poll'
 *   post:
 *     tags:
 *       - Polls
 *     summary: Create a new poll
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *               visibility:
 *                 type: string
 *                 enum: [public, private, unlisted]
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               settings:
 *                 type: object
 *                 properties:
 *                   anonymous:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Poll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid request
 *
 * /api/polls/{code}:
 *   get:
 *     tags:
 *       - Polls
 *     summary: Get poll by code
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Poll details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poll'
 *       404:
 *         description: Poll not found
 *
 * /api/polls/{code}/analytics:
 *   get:
 *     tags:
 *       - Polls
 *     summary: Get poll analytics
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Poll analytics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Poll not found
 *
 * /api/polls/{code}/publish:
 *   patch:
 *     tags:
 *       - Polls
 *     summary: Publish poll results
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Poll published
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Poll not found
 *
 * /api/votes:
 *   post:
 *     tags:
 *       - Votes
 *     summary: Submit response to poll
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vote'
 *     responses:
 *       201:
 *         description: Response submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 poll:
 *                   $ref: '#/components/schemas/Poll'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Poll not found
 *
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User signup
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request
 *
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid credentials
 */

export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ChaiPoll API",
      version: "1.0.0",
      description:
        "A full-stack polling platform with real-time updates, authentication, and analytics.",
      contact: {
        name: "ChaiPoll Team",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "jwt",
          description: "JWT token in HTTP-only cookie",
        },
      },
    },
    tags: [
      {
        name: "Polls",
        description: "Poll management endpoints",
      },
      {
        name: "Votes",
        description: "Vote submission endpoints",
      },
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
    ],
  },
  apis: ["./routes/*.js", "./swagger-docs.js"],
};
