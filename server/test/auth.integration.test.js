import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../app.js";
import User from "../models/User.js";

let replSet;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-auth";
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  await mongoose.connect(replSet.getUri());
  app = createApp();
}, 120_000);

afterAll(async () => {
  await mongoose.disconnect();
  if (replSet) await replSet.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth Integration Tests", () => {
  it("registers a new user and sets a cookie", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("John Doe");
    expect(res.body.email).toBe("john@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();

    const user = await User.findOne({ email: "john@example.com" });
    expect(user).toBeTruthy();
  });

  it("fails to register with existing email", async () => {
    await User.create({
      name: "Existing",
      email: "test@example.com",
      password: "hashedpassword",
    });

    const res = await request(app).post("/api/auth/signup").send({
      name: "New Guy",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("logs in an existing user and returns a token cookie", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Tester",
      email: "login@example.com",
      password: "secretpassword",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "secretpassword",
    });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.body.email).toBe("login@example.com");
  });

  it("fails to log in with wrong password", async () => {
    await User.create({
      name: "Tester",
      email: "wrong@example.com",
      password: "realpassword",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@example.com",
      password: "fake-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("protects private routes", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns generic message for forgot-password when email is unknown (no enumeration)", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "nobody@example.com", method: "otp" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if an account exists/i);
  });

  it("rejects forgot-password without method", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "john@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/validation/i);
  });

  // ============ 2FA Tests ============

  describe("Two-Factor Authentication (2FA)", () => {
    it("toggles 2FA on for authenticated user", async () => {
      // First, create and login a user
      await request(app).post("/api/auth/signup").send({
        name: "2FA Tester",
        email: "2fa@example.com",
        password: "password123",
      });

      const loginRes = await request(app).post("/api/auth/login").send({
        email: "2fa@example.com",
        password: "password123",
      });

      const cookies = loginRes.headers["set-cookie"];

      // Now toggle 2FA on
      const toggleRes = await request(app)
        .post("/api/auth/toggle-2fa")
        .set("Cookie", cookies)
        .send({ enabled: true });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.message).toMatch(/enabled successfully/i);
      expect(toggleRes.body.twoFactorEnabled).toBe(true);

      // Verify in database
      const user = await User.findOne({ email: "2fa@example.com" });
      expect(user.twoFactorEnabled).toBe(true);
    });

    it("toggles 2FA off for authenticated user", async () => {
      // Create user with 2FA disabled first
      const user = await User.create({
        name: "2FA Off Tester",
        email: "2faoff@example.com",
        password: "password123",
        twoFactorEnabled: false,
      });

      // Login and get cookies (no 2FA required)
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "2faoff@example.com",
        password: "password123",
      });

      const cookies = loginRes.headers["set-cookie"];

      // Toggle 2FA off
      const toggleRes = await request(app)
        .post("/api/auth/toggle-2fa")
        .set("Cookie", cookies)
        .send({ enabled: false });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.message).toMatch(/disabled successfully/i);
      expect(toggleRes.body.twoFactorEnabled).toBe(false);

      // Verify in database
      const updatedUser = await User.findOne({ email: "2faoff@example.com" });
      expect(updatedUser.twoFactorEnabled).toBe(false);
    });

    it("requires 2FA verification after login when 2FA is enabled", async () => {
      // Create user with 2FA enabled
      const user = await User.create({
        name: "2FA Login Tester",
        email: "2falogin@example.com",
        password: "password123",
        twoFactorEnabled: true,
      });

      // Try to login
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "2falogin@example.com",
        password: "password123",
      });

      // Should indicate 2FA is required
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.twoFactorRequired).toBe(true);
      expect(loginRes.body.email).toBe("2falogin@example.com");

      // User should have OTP set
      const dbUser = await User.findOne({ email: "2falogin@example.com" });
      expect(dbUser.twoFactorOTP).toBeDefined();
      expect(dbUser.twoFactorOTPExpire).toBeDefined();
    });

    it("verifies 2FA with valid OTP and generates JWT", async () => {
      // Create user and manually set OTP
      const user = await User.create({
        name: "2FA Verify Tester",
        email: "2faverify@example.com",
        password: "password123",
        twoFactorEnabled: true,
      });

      const validOTP = "123456";
      user.twoFactorOTP = validOTP;
      user.twoFactorOTPExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save();

      // Verify OTP
      const verifyRes = await request(app).post("/api/auth/verify-2fa").send({
        email: "2faverify@example.com",
        otp: validOTP,
      });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body._id).toBe(user._id.toString());
      expect(verifyRes.body.email).toBe("2faverify@example.com");
      expect(verifyRes.headers["set-cookie"]).toBeDefined();

      // OTP should be cleared
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.twoFactorOTP).toBeUndefined();
      expect(updatedUser.twoFactorOTPExpire).toBeUndefined();
    });

    it("rejects 2FA with invalid OTP", async () => {
      const user = await User.create({
        name: "2FA Invalid Tester",
        email: "2fainvalid@example.com",
        password: "password123",
        twoFactorEnabled: true,
      });

      const validOTP = "123456";
      user.twoFactorOTP = validOTP;
      user.twoFactorOTPExpire = Date.now() + 5 * 60 * 1000;
      await user.save();

      // Try with wrong OTP
      const verifyRes = await request(app).post("/api/auth/verify-2fa").send({
        email: "2fainvalid@example.com",
        otp: "999999",
      });

      expect(verifyRes.status).toBe(401);
      expect(verifyRes.body.message).toMatch(/invalid or expired/i);
    });

    it("rejects 2FA with expired OTP", async () => {
      const user = await User.create({
        name: "2FA Expired Tester",
        email: "2faexpired@example.com",
        password: "password123",
        twoFactorEnabled: true,
      });

      const expiredOTP = "123456";
      user.twoFactorOTP = expiredOTP;
      user.twoFactorOTPExpire = Date.now() - 1000; // Expired 1 second ago
      await user.save();

      // Try with expired OTP
      const verifyRes = await request(app).post("/api/auth/verify-2fa").send({
        email: "2faexpired@example.com",
        otp: expiredOTP,
      });

      expect(verifyRes.status).toBe(401);
      expect(verifyRes.body.message).toMatch(/invalid or expired/i);
    });

    it("prevents toggle-2fa without authentication", async () => {
      const toggleRes = await request(app)
        .post("/api/auth/toggle-2fa")
        .send({ enabled: true });

      expect(toggleRes.status).toBe(401);
    });
  });
});
