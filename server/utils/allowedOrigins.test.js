import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAllowedOrigins } from "./allowedOrigins.js";

describe("getAllowedOrigins", () => {
  let origAllowed;
  let origClient;

  beforeEach(() => {
    origAllowed = process.env.ALLOWED_ORIGINS;
    origClient = process.env.CLIENT_URL;
    delete process.env.ALLOWED_ORIGINS;
    delete process.env.CLIENT_URL;
  });

  afterEach(() => {
    if (origAllowed !== undefined) process.env.ALLOWED_ORIGINS = origAllowed;
    else delete process.env.ALLOWED_ORIGINS;
    if (origClient !== undefined) process.env.CLIENT_URL = origClient;
    else delete process.env.CLIENT_URL;
  });

  it("parses comma-separated ALLOWED_ORIGINS and appends CLIENT_URL and local dev", () => {
    process.env.ALLOWED_ORIGINS = "https://a.app, https://b.app ,";
    process.env.CLIENT_URL = "https://c.vercel.app";
    const origins = getAllowedOrigins();
    expect(origins).toEqual(
      expect.arrayContaining([
        "https://a.app",
        "https://b.app",
        "https://c.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ])
    );
    expect(new Set(origins).size).toBe(origins.length);
  });

  it("uses CLIENT_URL and localhost when ALLOWED_ORIGINS is unset", () => {
    process.env.CLIENT_URL = "https://prod.example";
    const origins = getAllowedOrigins();
    expect(origins).toContain("https://prod.example");
    expect(origins).toContain("http://localhost:5173");
    expect(new Set(origins).size).toBe(origins.length);
  });

  it("merges CLIENT_URL when ALLOWED_ORIGINS is set (both apply)", () => {
    process.env.ALLOWED_ORIGINS = "https://legacy.app";
    process.env.CLIENT_URL = "https://chai-poll.vercel.app";
    const origins = getAllowedOrigins();
    expect(origins).toContain("https://legacy.app");
    expect(origins).toContain("https://chai-poll.vercel.app");
  });

  it("normalizes CLIENT_URL trailing slash", () => {
    process.env.CLIENT_URL = "https://prod.example/";
    const origins = getAllowedOrigins();
    expect(origins).toContain("https://prod.example");
    expect(origins).not.toContain("https://prod.example/");
  });

  it("dedupes duplicate entries", () => {
    process.env.ALLOWED_ORIGINS = "https://same.app,https://same.app";
    process.env.CLIENT_URL = "https://same.app";
    expect(getAllowedOrigins().filter((o) => o === "https://same.app").length).toBe(1);
  });
});
