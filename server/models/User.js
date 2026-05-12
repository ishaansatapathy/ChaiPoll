import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    },
    minlength: 8,
    select: false,
  },
  avatar: {
    type: String,
    default: "default-avatar.png",
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },
  providerId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
  displayName: {
    type: String,
    trim: true,
  },
  isOnboarded: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user",
  },
  permissions: {
    type: [String],
    default: [],
    enum: [
      "manage_polls",
      "moderate_polls",
      "view_analytics",
      "manage_users",
      "ban_users",
      "delete_content",
      "system_settings",
      "view_admin_dashboard",
    ],
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: String,
  bannedAt: Date,
  bannedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  pollsCreated: {
    type: Number,
    default: 0,
  },
  pollsModerated: {
    type: Number,
    default: 0,
  },
  lastActiveAt: Date,
});

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user has a specific permission
userSchema.methods.hasPermission = function (permission) {
  if (this.isBanned) return false;
  if (this.role === "admin") return true;
  return this.permissions.includes(permission);
};

// Check if user has a specific role
userSchema.methods.hasRole = function (role) {
  if (this.isBanned) return false;
  return this.role === role;
};

// Check if user is admin or above
userSchema.methods.isAdmin = function () {
  if (this.isBanned) return false;
  return this.role === "admin";
};

// Check if user is moderator or above
userSchema.methods.isModerator = function () {
  if (this.isBanned) return false;
  return this.role === "admin" || this.role === "moderator";
};

export default mongoose.model("User", userSchema);
