import { test, expect } from "@playwright/test";

test.describe("Poll Voting Flow", () => {
  test("anonymous user can submit response to an anonymous poll", async ({ page }) => {
    // Create a poll as authenticated user
    await page.goto("/signup");
    const timestamp = Date.now();
    const email = `voter-${timestamp}@test.com`;
    await page.fill('input[name="name"]', "Poll Creator");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    // Create poll with anonymous mode
    await page.fill('input[name="title"]', "Anonymous Poll");
    await page.fill('input[placeholder*="Question"]', "Do you like this poll?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    // Extract poll code from URL
    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Log out
    await page.click("button:has-text(/Profile|Menu/i)");
    await page.click('button:has-text("Logout")');

    // Open poll as anonymous user in new context
    const context = await page.context().browser().newContext();
    const anonPage = await context.newPage();
    await anonPage.goto(`/polls/${pollCode}`);

    // Submit response
    await anonPage.click('input[value*="Do you like"]');
    await anonPage.click('button:has-text("Submit")');

    // Verify success message
    await expect(anonPage.locator("text=/submitted|success/i")).toBeVisible({
      timeout: 5000,
    });
    await context.close();
  });

  test("authenticated user can submit response to an authenticated poll", async ({ page }) => {
    // Create authenticated poll
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `auth-creator-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Authenticated Poll");
    await page.fill('input[placeholder*="Question"]', "Your experience?");
    await page.uncheck('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Log out and create new account
    await page.click("button:has-text(/Profile|Menu/i)");
    await page.click('button:has-text("Logout")');

    // Voter signs up
    await page.goto("/signup");
    const voterTimestamp = Date.now();
    await page.fill('input[name="name"]', "Voter");
    await page.fill('input[name="email"]', `voter-${voterTimestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');

    // Vote on poll
    await page.goto(`/polls/${pollCode}`);
    await page.click('input[value*="experience"]');
    await page.click('button:has-text("Submit")');

    // Verify success
    await expect(page.locator("text=/submitted|success/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("user cannot vote twice on the same poll", async ({ page }) => {
    // Setup: Create poll and vote once
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `dupvote-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "No Duplicates");
    await page.fill('input[placeholder*="Question"]', "Vote once?");
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Vote first time
    await page.goto(`/polls/${pollCode}`);
    await page.click('input[value*="Vote"]');
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(1000);

    // Try to vote again
    await page.goto(`/polls/${pollCode}`);
    const submitButton = page.locator('button:has-text("Submit")');
    await expect(submitButton).toBeDisabled({
      timeout: 5000,
    });
  });

  test("mandatory questions must be answered before submission", async ({ page }) => {
    // Create poll with mandatory question
    await page.goto("/signup");
    const timestamp = Date.now();
    await page.fill('input[name="name"]', "Creator");
    await page.fill('input[name="email"]', `mandatory-${timestamp}@test.com`);
    await page.fill('input[name="password"]', "password123");
    await page.click('button:has-text("Sign Up")');
    await page.goto("/create-poll");

    await page.fill('input[name="title"]', "Mandatory Test");
    await page.fill('input[placeholder*="Question"]', "This is mandatory");
    await page.check('input[name="mandatory"]');
    await page.check('input[name="anonymous"]');
    await page.click('button:has-text("Create Poll")');
    await page.waitForURL(/\/polls\//);

    const pollUrl = page.url();
    const pollCode = pollUrl.match(/\/polls\/([A-Z0-9]+)/)[1];

    // Try to submit without answering
    const context = await page.context().browser().newContext();
    const anonPage = await context.newPage();
    await anonPage.goto(`/polls/${pollCode}`);

    const submitButton = anonPage.locator('button:has-text("Submit")');
    await expect(submitButton).toBeDisabled();

    // Answer question and submit
    await anonPage.click('input[type="radio"]');
    await expect(submitButton).toBeEnabled();
    await context.close();
  });
});
