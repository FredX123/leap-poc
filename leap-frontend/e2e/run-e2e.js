/**
 * E2E test runner bootstrap.
 * Compiles TypeScript E2E files, then executes Jasmine on the compiled JS.
 *
 * Usage:  node e2e/run-e2e.js
 *
 * Prerequisites:
 *   1. Angular dev-server running:    ng serve
 *   2. Spring Boot backend running:   mvn spring-boot:run  (in leap-app)
 *
 * Environment variables (all optional):
 *   E2E_BASE_URL   — default http://localhost:4200
 *   E2E_TIMEOUT    — default 10000 (ms)
 *   E2E_HEADLESS   — set to "true" for headless Chrome (CI)
 */
const path = require('path');
const { execSync } = require('child_process');

// Step 1: Compile E2E TypeScript files to JavaScript
console.log('Compiling E2E tests...');
try {
  execSync('npx tsc -p tsconfig.e2e.json', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
} catch {
  console.error('TypeScript compilation failed.');
  process.exit(1);
}

// Step 2: Run Jasmine on the compiled JS output
const Jasmine = require('jasmine');
const runner = new Jasmine();
runner.loadConfigFile(path.resolve(__dirname, 'support', 'jasmine.json'));
runner.execute();
