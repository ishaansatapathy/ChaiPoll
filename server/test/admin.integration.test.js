import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "../app.js";
import User from "../models/User.js";
import Poll from "../models/Poll.js";

let replSet;
let app;
let adminUser;
let moderatorUser;
let regularUser;
let adminCookie;
let modCookie;
let userCookie;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-jwt-secret-admin";
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
  await Poll.deleteMany({});

  // Create admin
  const adminRes = await request(app).post("/api/auth/signup").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
  });
  adminCookie = adminRes.headers["set-cookie"];
  adminUser = adminRes.body;
  await User.findByIdAndUpdate(adminUser._id, { role: "admin" });

  // Create moderator
  const modRes = await request(app).post("/api/auth/signup").send({
    name: "Moderator User",
    email: "mod@test.com",
    password: "password123",
  });
  modCookie = modRes.headers["set-cookie"];
  moderatorUser = modRes.body;
  await User.findByIdAndUpdate(moderatorUser._id, { role: "moderator" });

  // Create regular user
  const userRes = await request(app).post("/api/auth/signup").send({
    name: "Regular User",
    email: "user@test.com",
    password: "password123",
  });
  userCookie = userRes.headers["set-cookie"];
  regularUser = userRes.body;
});

describe("Admin Management Tests", () => {
  it("admin can view all users", async () => {
    const res = await request(app).get("/api/admin/users").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it("regular user cannot access admin endpoints", async () => {
    const res = await request(app).get("/api/admin/users").set("Cookie", userCookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/admin|unauthorized/i);
  });

  it("admin can update user role", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/role`)
      .set("Cookie", adminCookie)
      .send({ role: "moderator" });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("moderator");
  });

  it("admin cannot change own role", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminUser._id}/role`)
      .set("Cookie", adminCookie)
      .send({ role: "user" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot change your own role/i);
  });

  it("admin can ban a user", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/ban`)
      .set("Cookie", adminCookie)
      .send({ reason: "Spam content" });

    expect(res.status).toBe(200);
    expect(res.body.user.isBanned).toBe(true);
    expect(res.body.user.banReason).toBe("Spam content");
  });

  it("banned user cannot create polls", async () => {
    // Ban the user
    await request(app)
      .patch(`/api/admin/users/${regularUser._id}/ban`)
      .set("Cookie", adminCookie)
      .send({ reason: "Spam" });

    // Try to create poll
    const res = await request(app)
      .post("/api/polls")
      .set("Cookie", userCookie)
      .send({
        title: "Test Poll",
        questions: [{ text: "Q1", options: ["A", "B"] }],
      });

    // Should return 403 because user is banned (need to update poll controller)
    expect(res.status).toBe(403);
  });

  it("admin can unban a user", async () => {
    // Ban user first
    await request(app)
      .patch(`/api/admin/users/${regularUser._id}/ban`)
      .set("Cookie", adminCookie)
      .send({ reason: "Spam" });

    // Unban user
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/unban`)
      .set("Cookie", adminCookie)
      .set("X-Requested-With", "XMLHttpRequest");

    expect(res.status).toBe(200);
    expect(res.body.user.isBanned).toBe(false);
  });

  it("admin can grant permissions to user", async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/permissions/grant`)
      .set("Cookie", adminCookie)
      .send({ permission: "view_analytics" });

    expect(res.status).toBe(200);
    expect(res.body.user.permissions).toContain("view_analytics");
  });

  it("admin can revoke permissions from user", async () => {
    // Grant permission first
    await request(app)
      .patch(`/api/admin/users/${regularUser._id}/permissions/grant`)
      .set("Cookie", adminCookie)
      .send({ permission: "view_analytics" });

    // Revoke it
    const res = await request(app)
      .patch(`/api/admin/users/${regularUser._id}/permissions/revoke`)
      .set("Cookie", adminCookie)
      .send({ permission: "view_analytics" });

    expect(res.status).toBe(200);
    expect(res.body.user.permissions).not.toContain("view_analytics");
  });

  it("moderator can flag a poll", async () => {
    const poll = await Poll.create({
      title: "Test Poll",
      createdBy: regularUser._id,
      questions: [{ text: "Q", options: [{ text: "1" }, { text: "2" }] }],
    });

    const res = await request(app)
      .patch(`/api/admin/polls/${poll._id}/flag`)
      .set("Cookie", modCookie)
      .send({ reason: "Inappropriate content" });

    expect(res.status).toBe(200);
    expect(res.body.poll.flagged).toBe(true);
  });

  it("admin can view dashboard stats", async () => {
    const res = await request(app).get("/api/admin/stats").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalUsers).toBeGreaterThan(0);
    expect(res.body.usersByRole).toBeDefined();
  });

  it("admin can view activity logs", async () => {
    const res = await request(app).get("/api/admin/logs").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.recentBans).toBeDefined();
    expect(res.body.recentFlags).toBeDefined();
  });
});
