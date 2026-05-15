import mongoose from "mongoose";
import crypto from "crypto";

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Please add a question text"],
    trim: true,
  },
  options: {
    type: [pollOptionSchema],
    validate: [(v) => v && v.length >= 2, "Each question must have at least 2 options"],
  },
  isMandatory: {
    type: Boolean,
    default: true,
  },
  correctOptionId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  type: {
    type: String,
    enum: ["single", "multiple"],
    default: "single",
  },
  totalVotes: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    questions: {
      type: [questionSchema],
      validate: [(v) => v && v.length >= 1, "Poll must have at least 1 question"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    totalParticipants: {
      type: Number,
      default: 0,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    settings: {
      anonymous: { type: Boolean, default: false },
      isPublished: { type: Boolean, default: false },
    },
    pollCode: {
      type: String,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    flagReason: String,
    flaggedAt: Date,
    flaggedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate unique pollCode before validation if it doesn't exist
const MAX_POLL_CODE_RETRIES = 10;
pollSchema.pre("validate", async function () {
  if (!this.pollCode) {
    let generatedCode;
    let attempts = 0;

    while (attempts < MAX_POLL_CODE_RETRIES) {
      generatedCode = crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
      // Use this.constructor to reference the model before it's fully compiled
      const existingPoll = await this.constructor.findOne({ pollCode: generatedCode });
      if (!existingPoll) break;
      attempts++;
    }

    if (attempts >= MAX_POLL_CODE_RETRIES) {
      throw new Error("Failed to generate a unique poll code after maximum retries. Please try again.");
    }

    this.pollCode = generatedCode;
  }
});

export default mongoose.model("Poll", pollSchema);
