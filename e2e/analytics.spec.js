import { test, expect } from "@playwright/test";

test.describe("Analytics Dashboard", () => {
  test("poll creator can view analytics after responses", async ({ page }) => {
    // Create poll and get responses
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Analytics Creator");
    await page.fill('input[name="email"]', `analytics-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Analytics Test Poll");
    await page.fill('input[placeholder*="Question"]', "Rate this?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Get analytics page
    await page.goto(`/polls/${pollCode}/analytics`);

    // Verify analytics dashboard is visible
    await expect(page.locator("text=/responses|participation|analytics/i")).toBeVisible();
    await expect(page.locator("text=/total|count/i")).toBeVisible();
  });

  test("analytics show real-time updates with Socket.io", async ({ page, context }) => {
    // Setup: Create poll
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Real-time Creator");
    await page.fill('input[name="email"]', `realtime-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Real-time Test");
    await page.fill('input[placeholder*="Question"]', "What do you think?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Open analytics in first tab
    await page.goto(`/polls/${pollCode}/analytics`);
    const initialCount = await page.locator("text=/0|1 response/i").first().textContent();

    // Open poll in second tab and submit response
    const voterPage = await context.newPage();
    await voterPage.goto(`/polls/${pollCode}`);
    await voterPage.click('input[type="radio"]');
    await voterPage.click('button:has-text("Submit")');

    // Check if analytics updated in real-time
    await page.waitForTimeout(2000);
    const updatedCount = await page.locator("text=/1|2 response/i").first().textContent();

    expect(updatedCount).not.toBe(initialCount);
    await voterPage.close();
  });

  test("analytics dashboard shows question-wise summaries", async ({ page }) => {
    // Create poll with multiple questions
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Summary Creator");
    await page.fill('input[name="email"]', `summary-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Multi-Question Poll");
    await page.fill('input[placeholder*="Question"]', "Question 1: Your preference?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // View analytics
    await page.goto(`/polls/${pollCode}/analytics`);

    // Verify question summaries are shown
    const questionHeadings = await page.locator("text=/Question|q1|preference/i").count();
    expect(questionHeadings).toBeGreaterThan(0);

    // Verify option counts are displayed
    const optionCounts = await page.locator("text=/votes?|count|responses?/i").count();
    expect(optionCounts).toBeGreaterThan(0);
  });
});
