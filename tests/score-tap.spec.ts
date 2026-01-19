import { test, expect } from '@playwright/test';
import {
  addPlayers,
  getPlayerCell,
  getScoreElement,
  rotatePlayer,
  getPositiveTapPosition,
  getNegativeTapPosition,
  performTap,
  expectScore,
  waitForScoreCommit,
  clearGameState,
  getPlayerBoundingBox,
  Rotation,
} from './helpers/test-utils';

const BASE_URL = 'http://localhost:5173';

test.describe('Tap Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await clearGameState(page);
    await page.reload();
  });

  test.describe('Basic taps (0° rotation)', () => {
    test('tap top increases score by 1', async ({ page }) => {
      await addPlayers(page, ['TestPlayer']);
      const box = await getPlayerBoundingBox(page, 'TestPlayer');
      const scoreElement = getScoreElement(getPlayerCell(page, 'TestPlayer'));

      await expectScore(scoreElement, 0);

      const tapPos = getPositiveTapPosition(box, 0);
      await performTap(page, tapPos);

      await expectScore(scoreElement, 1);
    });

    test('tap bottom decreases score by 1', async ({ page }) => {
      await addPlayers(page, ['TestPlayer']);
      const box = await getPlayerBoundingBox(page, 'TestPlayer');
      const scoreElement = getScoreElement(getPlayerCell(page, 'TestPlayer'));

      await expectScore(scoreElement, 0);

      const tapPos = getNegativeTapPosition(box, 0);
      await performTap(page, tapPos);

      await expectScore(scoreElement, -1);
    });
  });

  test.describe('Tap at all rotations', () => {
    const rotations: Rotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      test(`positive tap increases score at ${rotation}° rotation`, async ({ page }) => {
        await addPlayers(page, ['RotateTest']);
        const scoreElement = getScoreElement(getPlayerCell(page, 'RotateTest'));

        await expectScore(scoreElement, 0);

        // Rotate player to the target rotation
        const rotationClicks = rotation / 90;
        if (rotationClicks > 0) {
          await rotatePlayer(page, 'RotateTest', rotationClicks);
          // Wait for rotation animation to complete
          await page.waitForTimeout(300);
        }

        // Get updated bounding box after rotation
        const box = await getPlayerBoundingBox(page, 'RotateTest');
        const tapPos = getPositiveTapPosition(box, rotation);

        await performTap(page, tapPos);

        await expectScore(scoreElement, 1);
      });

      test(`negative tap decreases score at ${rotation}° rotation`, async ({ page }) => {
        await addPlayers(page, ['RotateTest']);
        const scoreElement = getScoreElement(getPlayerCell(page, 'RotateTest'));

        await expectScore(scoreElement, 0);

        // Rotate player to the target rotation
        const rotationClicks = rotation / 90;
        if (rotationClicks > 0) {
          await rotatePlayer(page, 'RotateTest', rotationClicks);
          await page.waitForTimeout(300);
        }

        const box = await getPlayerBoundingBox(page, 'RotateTest');
        const tapPos = getNegativeTapPosition(box, rotation);

        await performTap(page, tapPos);

        await expectScore(scoreElement, -1);
      });
    }
  });

  test.describe('Tap debounce behavior', () => {
    test('multiple rapid taps accumulate', async ({ page }) => {
      await addPlayers(page, ['TapAccum']);
      const box = await getPlayerBoundingBox(page, 'TapAccum');
      const scoreElement = getScoreElement(getPlayerCell(page, 'TapAccum'));

      await expectScore(scoreElement, 0);

      const tapPos = getPositiveTapPosition(box, 0);

      // Rapid taps (3 times)
      await performTap(page, tapPos);
      await page.waitForTimeout(100);
      await performTap(page, tapPos);
      await page.waitForTimeout(100);
      await performTap(page, tapPos);

      // Score should show accumulated value
      await expectScore(scoreElement, 3);
    });

    test('mixed positive/negative taps net correctly', async ({ page }) => {
      await addPlayers(page, ['MixedTap']);
      const box = await getPlayerBoundingBox(page, 'MixedTap');
      const scoreElement = getScoreElement(getPlayerCell(page, 'MixedTap'));

      await expectScore(scoreElement, 0);

      const positiveTap = getPositiveTapPosition(box, 0);
      const negativeTap = getNegativeTapPosition(box, 0);

      // +1, +1, -1, +1 = net +2
      await performTap(page, positiveTap);
      await page.waitForTimeout(100);
      await performTap(page, positiveTap);
      await page.waitForTimeout(100);
      await performTap(page, negativeTap);
      await page.waitForTimeout(100);
      await performTap(page, positiveTap);

      await expectScore(scoreElement, 2);
    });

    test('debounce timer resets on new tap', async ({ page }) => {
      await addPlayers(page, ['Debounce']);
      const box = await getPlayerBoundingBox(page, 'Debounce');
      const scoreElement = getScoreElement(getPlayerCell(page, 'Debounce'));

      await expectScore(scoreElement, 0);

      const tapPos = getPositiveTapPosition(box, 0);

      // First tap
      await performTap(page, tapPos);

      // Wait less than debounce time
      await page.waitForTimeout(1500);

      // Second tap - should reset the debounce timer
      await performTap(page, tapPos);

      // Wait less than debounce time again
      await page.waitForTimeout(1500);

      // Third tap - should reset again
      await performTap(page, tapPos);

      // Score should show all 3 accumulated (debounce not yet fired)
      await expectScore(scoreElement, 3);

      // Now wait for the debounce to complete
      await waitForScoreCommit(page);

      // Score should still be 3 (committed now)
      await expectScore(scoreElement, 3);
    });
  });
});
