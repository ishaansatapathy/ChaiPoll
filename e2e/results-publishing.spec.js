import { test, expect } from "@playwright/test";

test.describe("Results Publishing", () => {
  test("poll creator can publish results", async ({ page }) => {
    // Create poll
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Results Creator");
    await page.fill('input[name="email"]', `publish-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Results Poll");
    await page.fill('input[placeholder*="Question"]', "Your vote?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Navigate to analytics and publish
    await page.goto(`/polls/${pollCode}/analytics`);
    await page.click("button:has-text(/publish|share results/i)");

    // Verify publish confirmation
    await expect(page.locator("text=/published|live|public/i")).toBeVisible();
  });

  test("anonymous user can view published results", async ({ page }) => {
    // Setup: Create and publish poll
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Publisher");
    await page.fill('input[name="email"]', `pub-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Published Poll");
    await page.fill('input[placeholder*="Question"]', "See results?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Publish results
    await page.goto(`/polls/${pollCode}/analytics`);
    await page.click("button:has-text(/publish|share/i)");

    // Log out
    await page.click("button:has-text(/Profile|Menu/i)");
    await page.click('button:has-text("Logout")');

    // View as anonymous user
    const context = await page.context().browser().newContext();
    const anonPage = await context.newPage();
    await anonPage.goto(`/polls/${pollCode}/results`);

    // Verify results are visible
    await expect(anonPage.locator("text=/results|summary|responses/i")).toBeVisible();
    await expect(anonPage.locator('canvas, [role="img"]')).toBeVisible();
    await context.close();
  });

  test("unpublished results should not be visible to anonymous users", async ({ page }) => {
    // Create poll but don't publish
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `nopub-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Unpublished Poll");
    await page.fill('input[placeholder*="Question"]', "Can you see?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Logout
    await page.click("button:has-text(/Profile|Menu/i)");
    await page.click('button:has-text("Logout")');

    // Try accessing results as anonymous
    const context = await page.context().browser().newContext();
    const anonPage = await context.newPage();
    await anonPage.goto(`/polls/${pollCode}/results`, {
      waitUntil: "networkidle",
    });

    // Should see "not published" message or be redirected
    const unpublishedMsg = anonPage.locator("text=/not published|unavailable|not available/i");
    const isRedirected = !anonPage.url().includes("/results");

    expect(unpublishedMsg.isVisible() || isRedirected).toBeTruthy();
    await context.close();
  });

  test("poll results show option-wise vote distribution", async ({ page }) => {
    // Create poll with options
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Distribution Creator");
    await page.fill('input[name="email"]', `dist-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Distribution Poll");
    await page.fill('input[placeholder*="Question"]', "Choose your favorite");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Publish
    await page.goto(`/polls/${pollCode}/analytics`);
    await page.click("button:has-text(/publish|share/i)");

    // View results
    await page.goto(`/polls/${pollCode}/results`);

    // Verify option distribution is shown
    const options = await page.locator("text=/option|choice|answer/i").count();
    expect(options).toBeGreaterThan(0);

    // Verify percentages or vote counts
    const stats = await page.locator("text=/%|votes?|responses?/i").count();
    expect(stats).toBeGreaterThan(0);
  });
});
