import { Page, Locator, expect } from '@playwright/test';

// Constants matching the application code
export const COMMIT_DEBOUNCE_MS = 2000;
export const SCORE_TIMEOUT = 3000;
export const PIXELS_PER_UNIT = 30;
export const SWIPE_THRESHOLD = 20;

// Rotation values
export type Rotation = 0 | 90 | 180 | 270;

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DragVector {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Add a single player via settings menu
 */
export async function addPlayer(page: Page, name: string): Promise<void> {
  await page.getByLabel('Settings').click();
  await page.getByPlaceholder('Player name...').fill(name);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByLabel('Close settings').click();
  // Wait for settings to close
  await expect(page.getByLabel('Settings')).toBeVisible({ timeout: 5000 });
}

/**
 * Add multiple players via settings menu
 */
export async function addPlayers(page: Page, names: string[]): Promise<void> {
  await page.getByLabel('Settings').click();
  for (const name of names) {
    await page.getByPlaceholder('Player name...').fill(name);
    await page.getByRole('button', { name: 'Add' }).click();
  }
  await page.getByLabel('Close settings').click();
  await expect(page.getByLabel('Settings')).toBeVisible({ timeout: 5000 });
}

/**
 * Get the player cell locator by player name
 * The cell is identified by having cursor-ns-resize class and containing the player name
 */
export function getPlayerCell(page: Page, name: string): Locator {
  // The outer cell div has the swipe handlers and cursor-ns-resize class
  // Filter by hasText to find cells containing this player name
  return page.locator('.cursor-ns-resize').filter({ hasText: name }).first();
}

/**
 * Get the score element within a player cell
 */
export function getScoreElement(cell: Locator): Locator {
  return cell.locator('.score-text');
}

/**
 * Rotate a player by clicking the rotate button multiple times
 */
export async function rotatePlayer(page: Page, name: string, times: number): Promise<void> {
  const cell = getPlayerCell(page, name);
  const rotateButton = cell.getByLabel('Rotate player');
  for (let i = 0; i < times; i++) {
    await rotateButton.click();
    // Brief wait for rotation animation
    await page.waitForTimeout(100);
  }
}

/**
 * Calculate the tap position that should give +1 based on rotation
 *
 * Tap detection uses bias toward positive scores:
 * - 0°: Top ~70% = +1
 * - 90°: Right ~70% = +1
 * - 180°: Bottom ~70% = +1
 * - 270°: Left ~70% = +1
 */
export function getPositiveTapPosition(box: BoundingBox, rotation: Rotation): Position {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  switch (rotation) {
    case 0:
      // Top area (25% from top)
      return { x: centerX, y: box.y + box.height * 0.25 };
    case 90:
      // Right area (75% from left)
      return { x: box.x + box.width * 0.75, y: centerY };
    case 180:
      // Bottom area (75% from top)
      return { x: centerX, y: box.y + box.height * 0.75 };
    case 270:
      // Left area (25% from left)
      return { x: box.x + box.width * 0.25, y: centerY };
    default:
      return { x: centerX, y: box.y + box.height * 0.25 };
  }
}

/**
 * Calculate the tap position that should give -1 based on rotation
 *
 * Tap detection uses bias toward positive scores. The boundary is at 40% from center
 * in the relevant axis, meaning:
 * - 0°: Bottom 30% of cell = -1 (tap at y > 70% from top)
 * - 90°: Left 30% of cell = -1 (tap at x < 30% from left)
 * - 180°: Top 30% of cell = -1 (tap at y < 30% from top)
 * - 270°: Right 30% of cell = -1 (tap at x > 70% from left)
 *
 * Using 95% positions to ensure we're well within the -1 zone.
 */
export function getNegativeTapPosition(box: BoundingBox, rotation: Rotation): Position {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;

  switch (rotation) {
    case 0:
      // Bottom area (95% from top, well into the -1 zone)
      return { x: centerX, y: box.y + box.height * 0.95 };
    case 90:
      // Left area (5% from left)
      return { x: box.x + box.width * 0.05, y: centerY };
    case 180:
      // Top area (5% from top)
      return { x: centerX, y: box.y + box.height * 0.05 };
    case 270:
      // Right area (95% from left)
      return { x: box.x + box.width * 0.95, y: centerY };
    default:
      return { x: centerX, y: box.y + box.height * 0.95 };
  }
}

/**
 * Calculate drag vector that should increase score based on rotation
 *
 * Direction mapping (physical drag direction that increases score):
 * - 0°: Drag UP (negative Y direction)
 * - 90°: Drag RIGHT (positive X direction) - player's "up" when rotated 90° clockwise
 * - 180°: Drag DOWN (positive Y direction)
 * - 270°: Drag LEFT (negative X direction)
 */
export function getPositiveDragVector(box: BoundingBox, rotation: Rotation, units: number = 1): DragVector {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const distance = (units * PIXELS_PER_UNIT) + SWIPE_THRESHOLD;

  switch (rotation) {
    case 0:
      // Drag up (negative Y)
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY - distance };
    case 90:
      // Drag right (positive X)
      return { startX: centerX, startY: centerY, endX: centerX + distance, endY: centerY };
    case 180:
      // Drag down (positive Y)
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY + distance };
    case 270:
      // Drag left (negative X)
      return { startX: centerX, startY: centerY, endX: centerX - distance, endY: centerY };
    default:
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY - distance };
  }
}

/**
 * Calculate drag vector that should decrease score based on rotation
 *
 * Direction mapping (physical drag direction that decreases score):
 * - 0°: Drag DOWN (positive Y direction)
 * - 90°: Drag LEFT (negative X direction)
 * - 180°: Drag UP (negative Y direction)
 * - 270°: Drag RIGHT (positive X direction)
 */
export function getNegativeDragVector(box: BoundingBox, rotation: Rotation, units: number = 1): DragVector {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const distance = (units * PIXELS_PER_UNIT) + SWIPE_THRESHOLD;

  switch (rotation) {
    case 0:
      // Drag down (positive Y)
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY + distance };
    case 90:
      // Drag left (negative X)
      return { startX: centerX, startY: centerY, endX: centerX - distance, endY: centerY };
    case 180:
      // Drag up (negative Y)
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY - distance };
    case 270:
      // Drag right (positive X)
      return { startX: centerX, startY: centerY, endX: centerX + distance, endY: centerY };
    default:
      return { startX: centerX, startY: centerY, endX: centerX, endY: centerY + distance };
  }
}

/**
 * Perform a tap (click) at the specified position
 */
export async function performTap(page: Page, position: Position): Promise<void> {
  await page.mouse.click(position.x, position.y);
}

/**
 * Perform a drag gesture from start to end position
 */
export async function performDrag(page: Page, vector: DragVector): Promise<void> {
  await page.mouse.move(vector.startX, vector.startY);
  await page.mouse.down();
  await page.mouse.move(vector.endX, vector.endY, { steps: 10 });
  await page.mouse.up();
}

/**
 * Assert that the score element shows the expected value
 * Uses SCORE_TIMEOUT to account for debounce
 */
export async function expectScore(element: Locator, value: number): Promise<void> {
  await expect(element).toHaveText(String(value), { timeout: SCORE_TIMEOUT });
}

/**
 * Wait for pending score changes to commit (debounce period)
 */
export async function waitForScoreCommit(page: Page): Promise<void> {
  await page.waitForTimeout(COMMIT_DEBOUNCE_MS + 100);
}

/**
 * Clear localStorage to reset game state
 */
export async function clearGameState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('darkReckoning');
  });
}

/**
 * Get the bounding box for a player cell, throwing if not found
 */
export async function getPlayerBoundingBox(page: Page, name: string): Promise<BoundingBox> {
  const cell = getPlayerCell(page, name);
  await expect(cell).toBeVisible({ timeout: 5000 });
  const box = await cell.boundingBox();
  if (!box) {
    throw new Error(`Player cell bounding box not found for ${name}`);
  }
  return box;
}

/**
 * Generate player names for scaling tests
 */
export function generatePlayerNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `P${i + 1}`);
}
