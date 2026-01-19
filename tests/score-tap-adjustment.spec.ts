import { test, expect } from '@playwright/test';

test.describe('Score Adjustment', () => {
  test('should adjust score with single tap on top and bottom', async ({ page }) => {
    // Navigate to the local dev server
    await page.goto('http://localhost:5173');

    // Open Settings
    await page.getByLabel('Settings').click();

    // Add Player1
    await page.getByPlaceholder('Player name...').fill('Player1');
    await page.getByRole('button', { name: 'Add' }).click();

    // Add Player2
    await page.getByPlaceholder('Player name...').fill('Player2');
    await page.getByRole('button', { name: 'Add' }).click();

    // Close Settings
    await page.getByLabel('Close settings').click();

    // Wait for settings to close and player cells to be visible
    const playerCell = page.locator('div').filter({ hasText: /^Player1/ }).first();
    await expect(playerCell).toBeVisible({ timeout: 5000 });

    // Find the score element within Player1's cell
    const scoreElement = playerCell.locator('.score-text');
    await expect(scoreElement).toHaveText('0');

    // Get the bounding box for the player cell to calculate tap positions
    const boundingBox = await playerCell.boundingBox();
    if (!boundingBox) {
      throw new Error('Player cell bounding box not found');
    }

    // Calculate positions for top and bottom taps
    // Tap detection is biased toward +1: only bottom ~30% gives -1
    const centerX = boundingBox.x + boundingBox.width / 2;
    const topY = boundingBox.y + boundingBox.height * 0.25; // Top quarter (gives +1)
    const bottomY = boundingBox.y + boundingBox.height * 0.9; // Bottom 10% (gives -1)

    // Single tap on the TOP half - score should increase by 1
    await page.mouse.click(centerX, topY);

    // Verify the score is now 1 (wait for 2s debounce)
    await expect(scoreElement).toHaveText('1', { timeout: 3000 });

    // Single tap on the BOTTOM half - score should decrease by 1
    await page.mouse.click(centerX, bottomY);

    // Verify the score is back to 0
    await expect(scoreElement).toHaveText('0', { timeout: 3000 });
  });
});
