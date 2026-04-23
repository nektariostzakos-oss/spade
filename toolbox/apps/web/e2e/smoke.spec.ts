import { expect, test } from '@playwright/test';

test.describe('Toolbox smoke', () => {
  test('landing renders primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /toolbox/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /join as a pro|open feed/i })).toBeVisible();
  });

  test('feed route loads', async ({ page }) => {
    const res = await page.goto('/feed');
    expect(res?.status()).toBeLessThan(500);
  });

  test('apprentice mode loads', async ({ page }) => {
    await page.goto('/apprentice');
    await expect(page.getByRole('heading', { name: /trade careers/i })).toBeVisible();
  });

  test('sign-in page is reachable', async ({ page }) => {
    const res = await page.goto('/sign-in');
    expect(res?.status()).toBeLessThan(500);
  });

  test('quote submission redirects signed-out users', async ({ page }) => {
    await page.goto('/quote');
    await expect(page).toHaveURL(/sign-in/);
  });
});
