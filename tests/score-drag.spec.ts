import { test, expect } from '@playwright/test';
import {
  addPlayers,
  getPlayerCell,
  getScoreElement,
  rotatePlayer,
  getPositiveDragVector,
  getNegativeDragVector,
  performDrag,
  expectScore,
  waitForScoreCommit,
  clearGameState,
  getPlayerBoundingBox,
  Rotation,
  PIXELS_PER_UNIT,
  SWIPE_THRESHOLD,
} from './helpers/test-utils';

const BASE_URL = 'http://localhost:5173';

test.describe('Drag Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await clearGameState(page);
    await page.reload();
  });

  test.describe('Basic drags (0° rotation)', () => {
    test('drag up increases score', async ({ page }) => {
      await addPlayers(page, ['DragTest']);
      const box = await getPlayerBoundingBox(page, 'DragTest');
      const scoreElement = getScoreElement(getPlayerCell(page, 'DragTest'));

      await expectScore(scoreElement, 0);

      const dragVector = getPositiveDragVector(box, 0, 1);
      await performDrag(page, dragVector);

      await expectScore(scoreElement, 1);
    });

    test('drag down decreases score', async ({ page }) => {
      await addPlayers(page, ['DragTest']);
      const box = await getPlayerBoundingBox(page, 'DragTest');
      const scoreElement = getScoreElement(getPlayerCell(page, 'DragTest'));

      await expectScore(scoreElement, 0);

      const dragVector = getNegativeDragVector(box, 0, 1);
      await performDrag(page, dragVector);

      await expectScore(scoreElement, -1);
    });

    test('longer drag increases more (multi-unit)', async ({ page }) => {
      await addPlayers(page, ['MultiDrag']);
      const box = await getPlayerBoundingBox(page, 'MultiDrag');
      const scoreElement = getScoreElement(getPlayerCell(page, 'MultiDrag'));

      await expectScore(scoreElement, 0);

      // Drag for 3 units
      const dragVector = getPositiveDragVector(box, 0, 3);
      await performDrag(page, dragVector);

      await expectScore(scoreElement, 3);
    });
  });

  test.describe('Drag at all rotations', () => {
    const rotations: Rotation[] = [0, 90, 180, 270];

    for (const rotation of rotations) {
      test(`positive drag increases score at ${rotation}° rotation`, async ({ page }) => {
        await addPlayers(page, ['RotateDrag']);
        const scoreElement = getScoreElement(getPlayerCell(page, 'RotateDrag'));

        await expectScore(scoreElement, 0);

        // Rotate player to the target rotation
        const rotationClicks = rotation / 90;
        if (rotationClicks > 0) {
          await rotatePlayer(page, 'RotateDrag', rotationClicks);
          await page.waitForTimeout(300);
        }

        const box = await getPlayerBoundingBox(page, 'RotateDrag');
        const dragVector = getPositiveDragVector(box, rotation, 1);

        await performDrag(page, dragVector);

        await expectScore(scoreElement, 1);
      });

      test(`negative drag decreases score at ${rotation}° rotation`, async ({ page }) => {
        await addPlayers(page, ['RotateDrag']);
        const scoreElement = getScoreElement(getPlayerCell(page, 'RotateDrag'));

        await expectScore(scoreElement, 0);

        // Rotate player to the target rotation
        const rotationClicks = rotation / 90;
        if (rotationClicks > 0) {
          await rotatePlayer(page, 'RotateDrag', rotationClicks);
          await page.waitForTimeout(300);
        }

        const box = await getPlayerBoundingBox(page, 'RotateDrag');
        const dragVector = getNegativeDragVector(box, rotation, 1);

        await performDrag(page, dragVector);

        await expectScore(scoreElement, -1);
      });
    }
  });

  test.describe('Drag debounce behavior', () => {
    test('multiple rapid drags accumulate', async ({ page }) => {
      await addPlayers(page, ['DragAccum']);
      const box = await getPlayerBoundingBox(page, 'DragAccum');
      const scoreElement = getScoreElement(getPlayerCell(page, 'DragAccum'));

      await expectScore(scoreElement, 0);

      // Three single-unit drags
      for (let i = 0; i < 3; i++) {
        const dragVector = getPositiveDragVector(box, 0, 1);
        await performDrag(page, dragVector);
        await page.waitForTimeout(100);
      }

      // Score should show accumulated value
      await expectScore(scoreElement, 3);
    });

    test('mixed direction drags net correctly', async ({ page }) => {
      await addPlayers(page, ['MixedDrag']);
      const box = await getPlayerBoundingBox(page, 'MixedDrag');
      const scoreElement = getScoreElement(getPlayerCell(page, 'MixedDrag'));

      await expectScore(scoreElement, 0);

      // +1, +2, -1, +1 = net +3
      await performDrag(page, getPositiveDragVector(box, 0, 1));
      await page.waitForTimeout(100);
      await performDrag(page, getPositiveDragVector(box, 0, 2));
      await page.waitForTimeout(100);
      await performDrag(page, getNegativeDragVector(box, 0, 1));
      await page.waitForTimeout(100);
      await performDrag(page, getPositiveDragVector(box, 0, 1));

      await expectScore(scoreElement, 3);
    });
  });
});
