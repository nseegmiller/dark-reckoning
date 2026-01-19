import { test, expect } from '@playwright/test';
import {
  addPlayers,
  getPlayerCell,
  getScoreElement,
  rotatePlayer,
  getPositiveTapPosition,
  getPositiveDragVector,
  performTap,
  performDrag,
  expectScore,
  clearGameState,
  getPlayerBoundingBox,
  generatePlayerNames,
} from './helpers/test-utils';

const BASE_URL = 'http://localhost:5173';

test.describe('Player Scaling (1-8 players)', () => {
  const playerCounts = [1, 2, 3, 4, 5, 6, 7, 8];

  for (const count of playerCounts) {
    test.describe(`${count} player(s)`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL);
        await clearGameState(page);
        await page.reload();

        // Add the required number of players
        const names = generatePlayerNames(count);
        await addPlayers(page, names);
      });

      test('all players visible and tappable', async ({ page }) => {
        const names = generatePlayerNames(count);

        for (const name of names) {
          const cell = getPlayerCell(page, name);
          await expect(cell).toBeVisible({ timeout: 5000 });

          // Verify we can get a bounding box (element is rendered)
          const box = await cell.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.width).toBeGreaterThan(0);
          expect(box!.height).toBeGreaterThan(0);
        }
      });

      test('tap increases first player score', async ({ page }) => {
        const firstName = `P1`;
        const box = await getPlayerBoundingBox(page, firstName);
        const scoreElement = getScoreElement(getPlayerCell(page, firstName));

        await expectScore(scoreElement, 0);

        const tapPos = getPositiveTapPosition(box, 0);
        await performTap(page, tapPos);

        await expectScore(scoreElement, 1);
      });

      test('drag increases first player score', async ({ page }) => {
        const firstName = `P1`;
        const box = await getPlayerBoundingBox(page, firstName);
        const scoreElement = getScoreElement(getPlayerCell(page, firstName));

        await expectScore(scoreElement, 0);

        const dragVector = getPositiveDragVector(box, 0, 1);
        await performDrag(page, dragVector);

        await expectScore(scoreElement, 1);
      });

      test('rotated player responds correctly', async ({ page }) => {
        const firstName = `P1`;

        // Rotate to 180°
        await rotatePlayer(page, firstName, 2);
        await page.waitForTimeout(300);

        const box = await getPlayerBoundingBox(page, firstName);
        const scoreElement = getScoreElement(getPlayerCell(page, firstName));

        await expectScore(scoreElement, 0);

        // At 180°, positive tap area is in the bottom
        const tapPos = getPositiveTapPosition(box, 180);
        await performTap(page, tapPos);

        await expectScore(scoreElement, 1);
      });
    });
  }
});
