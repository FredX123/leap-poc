/** Base URL of the running Angular dev-server. */
export const BASE_URL = process.env['E2E_BASE_URL'] || 'http://localhost:4200';

/** Default explicit-wait timeout in milliseconds. */
export const TIMEOUT = parseInt(process.env['E2E_TIMEOUT'] || '10000', 10);

/** Run Chrome in headless mode (e.g. for CI). Set E2E_HEADLESS=true */
export const HEADLESS = process.env['E2E_HEADLESS'] === 'true';

/** Mock user identifiers (must match MockAuthController). */
export const MOCK_USERS = {
  ADMIN_ROLE:  'leap-poc-admin1',   // Role: APP_ADMIN
  ADMIN_GROUP: 'leap-poc-admin2',   // Group: GRP_ADMIN
  WRITE_ROLE:  'leap-poc-write1',   // Role: APP_WRITE
  WRITE_GROUP: 'leap-poc-write2',   // Group: GRP_WRITE
  READ_ROLE:   'leap-poc-read1',    // Role: APP_READ
  READ_GROUP:  'leap-poc-read2',    // Group: GRP_READ
} as const;
