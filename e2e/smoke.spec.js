import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home page loads hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ChaiPoll/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/People Want To Answer/i);
  });

  test("auth page shows sign-in mode", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(/Welcome/i);
  });

  test("signup route opens sign-up mode", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(/Create/i);
  });
});
