import { test, expect } from '@playwright/test';
import { clearGameState } from './helpers/test-utils';

const BASE_URL = 'http://localhost:5173';

// Theme configurations to test
// buttonText includes both the theme name and subtitle as seen by accessibility tools
const THEMES = [
  { id: 'atompunk', name: 'Atom Punk', buttonText: 'Atom Punk Terminal', className: 'theme-atompunk' },
  { id: 'nebula', name: 'Nebula', buttonText: 'Nebula Space', className: 'theme-nebula' },
  { id: 'clear', name: 'Clear', buttonText: 'Clear Readable', className: 'theme-clear' },
] as const;

test.describe('Theme Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await clearGameState(page);
    await page.reload();
  });

  test.describe('Theme selection UI', () => {
    test('all three theme buttons are visible in settings', async ({ page }) => {
      await page.getByLabel('Settings').click();

      for (const theme of THEMES) {
        await expect(page.getByRole('button', { name: theme.buttonText })).toBeVisible();
      }
    });

    test('default theme is atompunk', async ({ page }) => {
      const html = page.locator('html');
      await expect(html).toHaveClass(/theme-atompunk/);
    });
  });

  test.describe('Theme switching applies correct class', () => {
    for (const theme of THEMES) {
      test(`selecting ${theme.name} applies ${theme.className} class`, async ({ page }) => {
        await page.getByLabel('Settings').click();
        await page.getByRole('button', { name: theme.buttonText }).click();
        await page.getByLabel('Close settings').click();

        const html = page.locator('html');
        await expect(html).toHaveClass(new RegExp(theme.className));

        // Verify other theme classes are not present
        for (const otherTheme of THEMES) {
          if (otherTheme.id !== theme.id) {
            await expect(html).not.toHaveClass(new RegExp(otherTheme.className));
          }
        }
      });
    }
  });

  test.describe('Theme persistence', () => {
    for (const theme of THEMES) {
      test(`${theme.name} theme persists after page reload`, async ({ page }) => {
        // Set the theme
        await page.getByLabel('Settings').click();
        await page.getByRole('button', { name: theme.buttonText }).click();
        await page.getByLabel('Close settings').click();

        // Verify theme is applied
        const html = page.locator('html');
        await expect(html).toHaveClass(new RegExp(theme.className));

        // Wait for localStorage to persist (debounced save)
        await page.waitForTimeout(600);

        // Reload the page (don't clear state - we're testing persistence)
        await page.reload();

        // Verify theme persisted
        await expect(html).toHaveClass(new RegExp(theme.className));
      });
    }
  });

  test.describe('Theme visual characteristics', () => {
    test('Clear theme has no text-shadow on score', async ({ page }) => {
      // Add a player first
      await page.getByLabel('Settings').click();
      await page.getByPlaceholder('Player name...').fill('Test');
      await page.getByRole('button', { name: 'Add' }).click();

      // Switch to Clear theme
      await page.getByRole('button', { name: 'Clear Readable' }).click();
      await page.getByLabel('Close settings').click();

      // Check that score text has no text-shadow
      const scoreText = page.locator('.score-text').first();
      const textShadow = await scoreText.evaluate((el) => {
        return window.getComputedStyle(el).textShadow;
      });

      expect(textShadow).toBe('none');
    });

    test('Atom Punk theme has text-shadow on score', async ({ page }) => {
      // Add a player first
      await page.getByLabel('Settings').click();
      await page.getByPlaceholder('Player name...').fill('Test');
      await page.getByRole('button', { name: 'Add' }).click();

      // Ensure Atom Punk theme (default)
      await page.getByRole('button', { name: 'Atom Punk Terminal' }).click();
      await page.getByLabel('Close settings').click();

      // Check that score text has text-shadow
      const scoreText = page.locator('.score-text').first();
      const textShadow = await scoreText.evaluate((el) => {
        return window.getComputedStyle(el).textShadow;
      });

      expect(textShadow).not.toBe('none');
    });

    test('Clear theme uses system font stack', async ({ page }) => {
      await page.getByLabel('Settings').click();
      await page.getByRole('button', { name: 'Clear Readable' }).click();
      await page.getByLabel('Close settings').click();

      const body = page.locator('body');
      const fontFamily = await body.evaluate((el) => {
        return window.getComputedStyle(el).fontFamily;
      });

      // System font stack should include common system fonts
      expect(fontFamily).toMatch(/(-apple-system|BlinkMacSystemFont|Segoe UI|Roboto|Helvetica|Arial|sans-serif)/i);
    });

    test('Clear theme has no scanline overlay', async ({ page }) => {
      await page.getByLabel('Settings').click();
      await page.getByRole('button', { name: 'Clear Readable' }).click();
      await page.getByLabel('Close settings').click();

      // Check that body::before is not displayed
      const beforeDisplay = await page.evaluate(() => {
        return window.getComputedStyle(document.body, '::before').display;
      });

      expect(beforeDisplay).toBe('none');
    });

    test('Atom Punk theme has scanline overlay', async ({ page }) => {
      await page.getByLabel('Settings').click();
      await page.getByRole('button', { name: 'Atom Punk Terminal' }).click();
      await page.getByLabel('Close settings').click();

      // Check that body::before is displayed (not 'none')
      const beforeDisplay = await page.evaluate(() => {
        return window.getComputedStyle(document.body, '::before').display;
      });

      expect(beforeDisplay).not.toBe('none');
    });
  });

  test.describe('Theme switching during gameplay', () => {
    test('switching themes preserves player scores', async ({ page }) => {
      // Add a player and set a score
      await page.getByLabel('Settings').click();
      await page.getByPlaceholder('Player name...').fill('Scorer');
      await page.getByRole('button', { name: 'Add' }).click();
      await page.getByLabel('Close settings').click();

      // Perform some taps to change score
      const cell = page.locator('.cursor-ns-resize').filter({ hasText: 'Scorer' }).first();
      const box = await cell.boundingBox();
      if (!box) throw new Error('Cell not found');

      // Tap top area to increase score
      await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.25);
      await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.25);

      // Wait for score to update
      const scoreText = cell.locator('.score-text');
      await expect(scoreText).toHaveText('2', { timeout: 3000 });

      // Switch themes
      await page.getByLabel('Settings').click();
      await page.getByRole('button', { name: 'Nebula Space' }).click();
      await page.getByLabel('Close settings').click();

      // Verify score is preserved
      await expect(scoreText).toHaveText('2');

      // Switch to Clear theme
      await page.getByLabel('Settings').click();
      await page.getByRole('button', { name: 'Clear Readable' }).click();
      await page.getByLabel('Close settings').click();

      // Verify score is still preserved
      await expect(scoreText).toHaveText('2');
    });
  });
});
