// Increase timeout for Selenium E2E tests (default 5s is too short for browser interactions).
// Scaled by E2E_WAIT_FACTOR so slower machines get proportionally more time.
const waitFactor = parseFloat(process.env['E2E_WAIT_FACTOR'] || '1');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000 * waitFactor;
