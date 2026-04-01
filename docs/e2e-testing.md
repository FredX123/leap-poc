# E2E Testing — Design & Implementation

## Overview

The LEAP POC includes a client-side end-to-end (E2E) test suite built with **Selenium WebDriver** and **Jasmine**, running inside the Angular project (`leap-frontend/e2e/`). The tests exercise the full application through a Chrome browser, validating authentication flows, role-based access control, page interactions, and the comment system — all driven by the mock authentication mechanism to avoid dependency on Microsoft Entra ID.

### Key Design Decisions

| Decision | Rationale |
|---|---|
| **Selenium WebDriver** (not Playwright/Cypress) | Mirrors the Java/Selenium skill set of the team; npm package (`selenium-webdriver`) integrates cleanly into the Angular project |
| **Jasmine** (not Jest/Mocha) | Angular's default test runner; consistent with the unit test stack |
| **Mock auth only** | Azure free-trial constraints; Entra login requires browser-based OAuth redirect that is impractical to automate in E2E |
| **Compile-then-run** | Jasmine 6 uses dynamic `import()` which bypasses ts-node's `require()` hook; TypeScript is compiled to JS first, then Jasmine runs the compiled output |
| **Page Object pattern** | Encapsulates selectors and wait logic; specs remain readable and resilient to UI changes |

---

## Architecture

```
leap-frontend/
├── e2e/
│   ├── run-e2e.js              # Bootstrap: compile TS → run Jasmine
│   ├── config/
│   │   └── test-config.ts      # BASE_URL, TIMEOUT, HEADLESS, MOCK_USERS
│   ├── helpers/
│   │   ├── driver-setup.ts     # Shared Chrome WebDriver singleton
│   │   └── mock-auth.helper.ts # Login/logout/navigate utilities
│   ├── pages/                  # Page Object classes
│   │   ├── header.po.ts
│   │   ├── welcome.po.ts
│   │   ├── budget-report.po.ts
│   │   ├── user-management.po.ts
│   │   └── access-denied.po.ts
│   ├── specs/                  # Test specifications
│   │   ├── mock-auth.e2e-spec.ts
│   │   ├── welcome.e2e-spec.ts
│   │   ├── navigation-rbac.e2e-spec.ts
│   │   ├── budget-report.e2e-spec.ts
│   │   ├── api-auth.e2e-spec.ts
│   │   └── comment.e2e-spec.ts
│   └── support/
│       ├── jasmine.json        # Jasmine configuration
│       └── jasmine-setup.ts    # Global timeout (60 s)
├── tsconfig.e2e.json           # TypeScript config for E2E compilation
└── out-tsc/e2e/                # Compiled JS output (gitignored)
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:4200` | Angular dev-server URL |
| `E2E_TIMEOUT` | `10000` | Explicit-wait timeout in milliseconds (before scaling) |
| `E2E_WAIT_FACTOR` | `1` | Global multiplier for all wait/sleep durations. Set to `2` on slower machines to double all timeouts |
| `E2E_ACTION_DELAY` | `500` | Delay in ms before each user action (click, type) to simulate human speed. Set to `0` for full speed |
| `E2E_HEADLESS` | `false` | Run Chrome in headless mode (set to `true` for CI) |

### Mock Users

Six predefined mock users cover both role-based and group-based access. Each user maps to a single permission tier:

| Identifier | Display Name | Access Via | Permission |
|---|---|---|---|
| `leap-poc-admin1` | Admin1 Test | Role: `APP_ADMIN` | Admin |
| `leap-poc-admin2` | Admin2 Test | Group: `GRP_ADMIN` | Admin |
| `leap-poc-write1` | Write1 Test | Role: `APP_WRITE` | Write |
| `leap-poc-write2` | Write2 Test | Group: `GRP_WRITE` | Write |
| `leap-poc-read1` | Read1 Test | Role: `APP_READ` | Read |
| `leap-poc-read2` | Read2 Test | Group: `GRP_READ` | Read |

---

## Execution

### Prerequisites

Both servers must be running before executing tests:

1. **Backend:** `mvn spring-boot:run` (leap-app, port 18080)
2. **Frontend:** `ng serve` (port 4200)

### Commands

```bash
# Run with visible Chrome browser
npm run e2e

# Run headless (for CI)
npm run e2e:headless

# Run on a slower machine (double all wait times)
set E2E_WAIT_FACTOR=2&& npm run e2e

# Run at full speed with no human delays (CI)
set E2E_ACTION_DELAY=0&& set E2E_HEADLESS=true&& npm run e2e

# Run with longer human pauses (1 second between actions)
set E2E_ACTION_DELAY=1000&& npm run e2e
```

### Execution Pipeline

1. `run-e2e.js` invokes `npx tsc -p tsconfig.e2e.json` to compile TypeScript to `out-tsc/e2e/`
2. Jasmine loads its configuration from `e2e/support/jasmine.json`
3. Jasmine loads the setup helper (`jasmine-setup.js`) which sets a 60-second spec timeout (scaled by `WAIT_FACTOR`)
4. All `*.e2e-spec.js` files under `out-tsc/e2e/specs/` are executed sequentially
5. Each spec file creates a shared Chrome WebDriver in `beforeAll` and quits it in `afterAll`

---

## Implementation Details

### WebDriver Setup (`driver-setup.ts`)

A shared Chrome WebDriver singleton is created once per spec file and reused across all tests within that file. Configuration:

- **Headless mode** controlled by `E2E_HEADLESS` environment variable
- **Chrome arguments:** `--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`, `--window-size=1366,768`
- Singleton pattern: `getDriver()` creates on first call, returns the same instance on subsequent calls
- Cleanup: `quitDriver()` called in `afterAll`

### Mock Auth Helper (`mock-auth.helper.ts`)

High-level functions that abstract the mock authentication UI:

- **`resetToAnonymous(driver)`** — Clears all cookies and navigates to the base URL to establish a clean anonymous state
- **`mockLoginAs(driver, username)`** — Enables the mock toggle, selects the specified user from the dropdown, and waits for the authenticated UI state
- **`mockLogout(driver)`** — Clicks the logout button and waits for the anonymous UI state
- **`navigateTo(driver, path)`** — Navigates to `BASE_URL + path`

### Page Objects

Each page object encapsulates:

- **Selectors** — CSS selectors and XPath expressions for page elements
- **Wait logic** — `until.elementLocated()` and `until.elementIsVisible()` with configurable timeout to handle asynchronous rendering
- **State queries** — Boolean methods (`isXVisible()`, `isInEditMode()`) that return current UI state
- **Actions** — Click, type, and submit operations with built-in waits

#### BudgetReportPage (most comprehensive)

The budget report page object covers both the data table and the slide-in comment panel:

**Table operations:** `waitForPage()`, `getRowCount()`, `clickEditOnRow()`, `isInEditMode()`, `clickCancelEdit()`

**Comment panel operations:** `openCommentPanel()`, `closeCommentPanel()`, `typeComment()`, `submitComment()`, `getCommentEntryCount()`

**Comment CRUD:** `clickReplyOnFirstComment()`, `typeAndSubmitReply()`, `clickEditOnFirstComment()`, `editCommentAndSave()`, `cancelCommentEdit()`, `clickDeleteOnFirstComment()`, `confirmDeleteComment()`, `cancelDeleteComment()`

**Queries:** `getFirstCommentText()`, `getAllCommentTexts()`, `getFirstCommentAuthor()`, `isEditedBadgeVisible()`, `getRepliesContainerCount()`, `getCommentCountBadge()`

### Wait Strategy

A recurring pattern across page objects:

```typescript
// Locate + wait for visibility before interacting
const element = await this.driver.wait(
  until.elementLocated(By.css('selector')), TIMEOUT
);
await this.driver.wait(until.elementIsVisible(element), TIMEOUT);
await element.click();
```

Some methods also wait for **state transitions** after an action to avoid race conditions:

```typescript
// After clicking cancel, wait for edit mode indicators to disappear
await btn.click();
await this.driver.wait(async () => {
  const els = await this.driver.findElements(By.css('button.btn-success .bi-check-lg'));
  return els.length === 0;
}, TIMEOUT);
```

---

## Test Specifications

### Summary

| Spec File | Tests | Area |
|---|---|---|
| `mock-auth.e2e-spec.ts` | 13 | Mock authentication toggle, login, logout, user switching |
| `welcome.e2e-spec.ts` | 9 | Welcome page content, reactivity, role/group display |
| `navigation-rbac.e2e-spec.ts` | 17 | Navigation links per role/group, route guards, access-denied redirects |
| `budget-report.e2e-spec.ts` | 14 | Budget table, edit mode, comment buttons per role and group |
| `api-auth.e2e-spec.ts` | 12 | API endpoint authorization per role (admin/write/read/anonymous) |
| `comment.e2e-spec.ts` | 25 | Comment CRUD, replies, edit/cancel, delete, role & group restrictions |
| **Total** | **90** | |

### 1. Mock Authentication (`mock-auth.e2e-spec.ts`)

Validates the mock authentication UI in the header:

- **Anonymous state** — mock toggle visible, login button visible, no logout button, no user name displayed
- **Toggle & load** — enabling the mock toggle loads the user dropdown
- **Login all 6 users** — each mock user can log in and displays the correct authenticated state (username, logout button, Mock badge)
- **Logout** — returns to anonymous state, clears session
- **User switching** — log out of one user and into another

### 2. Welcome Page (`welcome.e2e-spec.ts`)

Validates the welcome/home page content:

- **Page structure** — title text, API test links count
- **Anonymous content** — description visible when not logged in
- **Authenticated content** — welcome alert with user name, roles or groups listed
- **Mock badge** — "Mock" indicator shown in welcome heading
- **Reactivity** — switching users immediately updates the greeting without page reload
- **Logout transition** — welcome alert disappears, anonymous content returns

### 3. Navigation & RBAC (`navigation-rbac.e2e-spec.ts`)

Validates role-based navigation and route guards:

- **Admin role** — sees "User Management" and "Guarded [Admin]" links, can navigate to User Management, does NOT see "Budget Report"
- **Admin group** — same visibility as admin role (group-based authorization)
- **Write role** — sees "Budget Report", does NOT see "User Management", can navigate to Budget Report
- **Write group** — same as write role
- **Read role** — sees "Budget Report", does NOT see "User Management", can navigate to Budget Report
- **Read group** — sees "Budget Report" (group-based authorization)
- **Access-denied redirects** — read user redirected from admin-only route; write user redirected from user-management; read user redirected from write-only route
- **Back to Home** — access-denied page "Back to Home" link works

### 4. Budget Report (`budget-report.e2e-spec.ts`)

Validates budget table interactions by role and group:

- **Write role** — table displays with data rows, edit buttons visible, can enter and cancel edit mode, comment buttons visible
- **Read role** — table displays with data rows, edit buttons NOT visible, comment buttons still visible
- **Write group (GRP_WRITE)** — table displays, edit buttons visible, comment buttons visible
- **Read group (GRP_READ)** — table displays, edit buttons NOT visible, comment buttons visible

### 5. API Authorization (`api-auth.e2e-spec.ts`)

Validates backend API authorization via the welcome page's API test links:

- **Anonymous** — all 3 API links show "Please log in" toast
- **Admin role** — admin-only API succeeds, write-only and read-only APIs fail
- **Write role** — admin-only API fails, write-only API succeeds, read-only API fails
- **Read role** — admin-only and write-only APIs fail, read-only API succeeds

### 6. Comment System (`comment.e2e-spec.ts`)

Validates the full comment feature set:

**Write user (APP_WRITE):**
- Open and close the comment panel
- Comment input textarea is visible
- Submit a new comment and verify it appears
- Author name is displayed on created comments
- Click Reply → reply input appears
- Submit a reply → nested replies container rendered
- Click Edit on own comment → edit textarea appears
- Cancel edit → returns to view mode
- Save edit → comment text updated in panel
- Delete a comment (without replies) → removed immediately
- Comment count badge updates on rows with comments

**Read user (APP_READ):**
- Can open the comment panel
- Comment input textarea is NOT visible
- Reply, edit, and delete buttons are NOT visible
- Can still view existing comments

**Write group user (GRP_WRITE):**
- Can open the comment panel and see comment input
- Can submit a comment as a group-based write user

**Read group user (GRP_READ):**
- Can open the comment panel
- Comment input textarea is NOT visible
- Reply buttons are NOT visible

**Multi-row behavior:**
- Comment panel opens correctly on different table rows
- Different rows show independent comment threads

---

## Design Patterns & Conventions

### Selector Strategy

Selectors follow a priority order:

1. **`aria-label` attributes** — preferred for interactive elements (e.g., `button[aria-label="Close comments panel"]`)
2. **Scoped CSS selectors** — scoped to parent containers to avoid matching unrelated elements (e.g., `.comment-panel.open .panel-header button`)
3. **Bootstrap class combinations** — for styled elements (e.g., `button.btn-outline-primary`, `.badge.rounded-pill.bg-primary`)
4. **XPath** — used only when text content matching is needed (e.g., `//h2[contains(text(),'Budget Report')]`)

### Test Isolation

Each `describe` block uses `beforeEach` to:

1. Reset to anonymous state (`resetToAnonymous`)
2. Log in as the required mock user (`mockLoginAs`)
3. Navigate to the target page (`navigateTo`)
4. Re-instantiate the page object and wait for loading

This ensures each test starts from a known state regardless of the order or outcome of previous tests.

### Handling Async Operations

All wait durations are scaled by the `WAIT_FACTOR` environment variable so the same tests work on both fast and slow machines.

Every user-visible action (click, type, select, navigate) is preceded by a `humanDelay()` call (default 500ms, configurable via `E2E_ACTION_DELAY`). This simulates the natural pause a human takes between interactions and makes test execution visually observable.

For operations that trigger backend API calls (comment creation, editing, deletion):

- `pause(driver, 2000)` — centralized helper that applies `WAIT_FACTOR` to the base duration
- Explicit waits (`driver.wait(until.elementLocated(...), TIMEOUT)`) use the already-scaled `TIMEOUT` constant
- Post-action waits ensure state transitions complete before assertions (e.g., waiting for edit mode indicators to disappear after clicking Cancel)

### Defensive Seeding

Tests that depend on existing data (edit, delete, reply) include a seed step:

```typescript
const count = await budgetPage.getCommentEntryCount();
if (count === 0) {
  await budgetPage.typeComment('Seed comment');
  await budgetPage.submitComment();
  await driver.sleep(2000);
}
```

This makes the tests resilient to running against a clean database.
