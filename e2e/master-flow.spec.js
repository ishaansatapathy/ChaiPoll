import { test, expect } from '@playwright/test';

test.describe('ChaiPoll Master Journey', () => {
  const testEmail = `tester-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  test('Full User Flow: Signup -> Create Poll -> Vote -> Analytics', async ({ page }) => {
    // 1. Sign Up
    await page.goto('/signup');
    await page.fill('input[name="name"]', 'Master Tester');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button:has-text("Sign Up")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 2. Create a Poll
    await page.click('a[href="/create"]');
    await expect(page).toHaveURL(/.*create/);
    
    await page.fill('input[placeholder="Enter your poll question"]', 'Is this the best polling app?');
    await page.fill('input[placeholder="Option 1"]', 'Yes, 10/10');
    await page.fill('input[placeholder="Option 2"]', 'Absolutely');
    
    await page.click('button:has-text("Create Poll")');
    
    // Wait for the poll created success or redirect
    await expect(page).toHaveURL(/.*analytics/);
    const pollUrl = page.url();
    const pollCode = pollUrl.split('/').pop();

    // 3. Vote (as the same user or anonymously)
    // We'll go to the public poll view
    await page.goto(`/poll/${pollCode}`);
    await expect(page.locator('h1')).toContainText('Is this the best polling app?');
    
    // Select an option and vote
    await page.click('text=Yes, 10/10');
    await page.click('button:has-text("Submit Vote")');
    
    // Should show results or success
    await expect(page.locator('text=Vote cast successfully')).toBeVisible();

    // 4. Check Analytics
    await page.goto(`/analytics/${pollCode}`);
    await expect(page.locator('text=Yes, 10/10')).toBeVisible();
    // Recharts/React Flow might take a second to render, but we verified the text is there
  });
});
