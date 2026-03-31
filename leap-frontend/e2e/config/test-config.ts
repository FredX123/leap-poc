import { WebDriver } from 'selenium-webdriver';

/** Base URL of the running Angular dev-server. */
export const BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';

/**
 * Global wait-time multiplier for slower machines.
 * Set E2E_WAIT_FACTOR=2 to double all wait/sleep durations.
 * Default: 1 (no scaling).
 */
export const WAIT_FACTOR = parseFloat(process.env['E2E_WAIT_FACTOR'] || '1');

/** Default explicit-wait timeout in milliseconds (scaled by WAIT_FACTOR). */
export const TIMEOUT = parseInt(process.env['E2E_TIMEOUT'] || '10000', 10) * WAIT_FACTOR;

/** Run Chrome in headless mode (e.g. for CI). Set E2E_HEADLESS=true */
export const HEADLESS = process.env['E2E_HEADLESS'] === 'true';

/**
 * Delay in ms before each user-visible action (click, type, select) to
 * simulate human-like interaction speed.
 * Set E2E_ACTION_DELAY=0 to run at full speed (e.g. for CI).
 * Default: 500 ms (scaled by WAIT_FACTOR).
 */
export const ACTION_DELAY = parseInt(process.env['E2E_ACTION_DELAY'] || '500', 10) * WAIT_FACTOR;

/** Scaled sleep — use instead of driver.sleep() so the duration respects WAIT_FACTOR. */
export function pause(driver: WebDriver, ms: number): Promise<void> {
  return driver.sleep(ms * WAIT_FACTOR);
}

/** Brief human-like pause before an action. Call before clicks, typing, etc. */
export function humanDelay(driver: WebDriver): Promise<void> {
  return ACTION_DELAY > 0 ? driver.sleep(ACTION_DELAY) : Promise.resolve();
}

/** Mock user identifiers (must match MockAuthController). */
export const MOCK_USERS = {
  ADMIN_ROLE:  'leap-poc-admin1',   // Role: APP_ADMIN
  ADMIN_GROUP: 'leap-poc-admin2',   // Group: GRP_ADMIN
  WRITE_ROLE:  'leap-poc-write1',   // Role: APP_WRITE
  WRITE_GROUP: 'leap-poc-write2',   // Group: GRP_WRITE
  READ_ROLE:   'leap-poc-read1',    // Role: APP_READ
  READ_GROUP:  'leap-poc-read2',    // Group: GRP_READ
} as const;
