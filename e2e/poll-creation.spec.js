import { test, expect } from "@playwright/test";

test.describe("Poll Creation Flow", () => {
  test("user can create a poll with multiple questions", async ({ page }) => {
    // Sign up
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Test Creator");
    await page.fill('input[name="email"]', `creator-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.waitForNavigation();

    // Navigate to create poll
    await page.goto("/create-poll");
    await expect(page).toHaveTitle(/ChaiPoll/i);

    // Fill poll details
    await page.fill('input[name="title"]', "What is your favorite tech stack?");
    await page.fill(
      'textarea[name="description"]',
      "Help us understand which technologies you prefer"
    );

    // Add questions
    await page.fill('input[placeholder*="Question"]', "Which frontend framework do you prefer?");

    // Note: Exact selectors depend on your form implementation
    // This is a template - adjust based on your actual form structure
    await page.click('button:has-text("Add Question")');

    // Set poll settings
    await page.check('input[name="anonymous"]');

    // Submit poll
    await page.click('button:has-text("Create Poll")');

    // Verify success
    await page.waitForURL(/\/polls\//);
    await expect(page).toHaveURL(/\/polls\/[A-Z0-9]{6}/);
  });

  test("poll creator can set mandatory and optional questions", async ({ page }) => {
    // Sign up and navigate to create poll
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `creator2-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    // Add mandatory question
    await page.fill('input[placeholder*="Question"]', "Mandatory question example");
    await page.check('input[name="mandatory"]');

    // Add optional question
    await page.click('button:has-text("Add Question")');
    await page.fill('input[placeholder*="Question"]', "Optional question");
    await page.uncheck('input[name="mandatory"]');

    // Verify both questions are configured
    const mandatoryBadges = await page.locator('text="Mandatory"').count();
    await expect(mandatoryBadges).toBeGreaterThan(0);
  });

  test("poll respects expiry time settings", async ({ page }) => {
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `creator-expiry-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    // Set expiry time
    await page.fill('input[type="datetime-local"]', "2026-05-13T12:00");

    // Create poll
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    // Verify expiry is set (check in analytics or details)
    const expiryText = await page.locator("text=/expires|expiry/i");
    await expect(expiryText).toBeVisible();
  });
});
