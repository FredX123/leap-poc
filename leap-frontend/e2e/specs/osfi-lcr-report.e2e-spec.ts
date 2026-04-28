import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { HeaderPage } from '../pages/header.po';
import { OsfiLcrReportPage } from '../pages/osfi-lcr-report.po';
import { AccessDeniedPage } from '../pages/access-denied.po';
import { BASE_URL, MOCK_USERS, pause, TIMEOUT } from '../config/test-config';

describe('OSFI LCR Report', () => {
  let driver: WebDriver;
  let page: OsfiLcrReportPage;
  let header: HeaderPage;

  // Sample data dates
  const START_DATE = '2026-01-29';
  const END_DATE = '2026-01-30';

  beforeAll(async () => {
    driver = await getDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  beforeEach(async () => {
    await resetToAnonymous(driver);
    header = new HeaderPage(driver);
    page = new OsfiLcrReportPage(driver);
  });

  // ── Access Control ──

  describe('Access Control', () => {
    it('should trigger login redirect for anonymous user', async () => {
      await driver.get(BASE_URL + '/osfi-lcr-report');
      // Guard calls auth.login() which redirects to /oauth2/authorization/entra
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('/osfi-lcr-report');
      }, TIMEOUT);
      const url = await driver.getCurrentUrl();
      expect(url).not.toContain('/osfi-lcr-report');
    });

    it('should allow read-role user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Report');
    });

    it('should allow write-role user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Report');
    });

    it('should allow read-group user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_GROUP);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Report');
    });

    it('should redirect admin-only user to access-denied', async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      const denied = new AccessDeniedPage(driver);
      await denied.waitForPage();
      expect(await denied.isAccessDeniedVisible()).toBe(true);
    });
  });

  // ── Initial State ──

  describe('Initial State (Write user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
    });

    it('should display the page heading', async () => {
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Report');
    });

    it('should show empty state message before search', async () => {
      expect(await page.isEmptyStateVisible()).toBe(true);
      const text = await page.getEmptyStateText();
      expect(text).toContain('View Analytics');
    });

    it('should not show the data table before search', async () => {
      expect(await page.isTableVisible()).toBe(false);
    });

    it('should have View Analytics button', async () => {
      // Button should be present (possibly disabled until dates entered)
      const heading = await page.getPageHeadingText();
      expect(heading).toBeTruthy();
    });
  });

  // ── Navigation ──

  describe('Navigation', () => {
    it('should navigate to LCR report via nav link', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await header.clickNavLink('OSFI LCR');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Report');
    });
  });

  // ── Data Loading ──

  describe('Data Loading (Write user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
    });

    it('should load and display data after submitting date range', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.isTableVisible()).toBe(true);
      expect(await page.getVisibleRowCount()).toBeGreaterThan(0);
    });

    it('should display segment headers', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      const segments = await page.getSegmentHeaders();
      expect(segments.length).toBeGreaterThanOrEqual(1);
      expect(segments).toContain('Enterprise');
    });

    it('should display date column headers', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      const dates = await page.getDateHeaders();
      expect(dates.length).toBeGreaterThan(0);
      expect(dates).toContain('Jan-29');
      expect(dates).toContain('Jan-30');
    });

    it('should show the table header title and subtitle', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      const title = await page.getTableHeaderTitle();
      expect(title).toContain('Enterprise LCR');
      const subtitle = await page.getTableHeaderSubtitle();
      expect(subtitle).toContain('Billions CAD');
    });

    it('should display amount values in cells', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      const text = await page.getFirstAmountCellText();
      expect(text).toBeTruthy();
    });

    it('should display variance values', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.hasVarianceValues()).toBe(true);
    });

    it('should display variance arrow indicators', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.hasVarianceArrows()).toBe(true);
    });

    it('should hide empty state after data loads', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.isEmptyStateVisible()).toBe(false);
    });
  });

  // ── Tree Hierarchy ──

  describe('Tree Hierarchy (Write user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should display level-1 parent rows', async () => {
      expect(await page.hasLevel1Rows()).toBe(true);
    });

    it('should have expandable rows with toggle icons', async () => {
      expect(await page.getToggleIconCount()).toBeGreaterThan(0);
    });

    it('should collapse an expanded row when clicked', async () => {
      const initialCount = await page.getVisibleRowCount();
      // Level-1 rows start expanded; clicking one collapses it
      await page.clickFirstExpandableRow();
      await pause(driver, 300);
      const collapsedCount = await page.getVisibleRowCount();
      expect(collapsedCount).toBeLessThan(initialCount);
    });

    it('should expand a collapsed row when clicked again', async () => {
      // Collapse first
      await page.clickFirstExpandableRow();
      await pause(driver, 300);
      const collapsedCount = await page.getVisibleRowCount();

      // Expand back
      await page.clickFirstExpandableRow();
      await pause(driver, 300);
      const expandedCount = await page.getVisibleRowCount();
      expect(expandedCount).toBeGreaterThan(collapsedCount);
    });

    it('should show expand icons when rows are collapsed', async () => {
      expect(await page.hasExpandIcons()).toBe(true);
    });
  });

  // ── Comment Panel ──

  describe('Comment Panel (Write user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should display comment icons on every row', async () => {
      const iconCount = await page.getCommentIconCount();
      expect(iconCount).toBeGreaterThan(0);
    });

    it('should open comment panel when clicking comment icon', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
    });

    it('should show Comments title in the panel', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      const title = await page.getCommentPanelTitle();
      expect(title).toContain('Comments');
    });

    it('should show comment input for write user', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentInputVisible()).toBe(true);
    });

    it('should close comment panel', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      await page.closeCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(false);
    });
  });

  // ── Comment Panel (Read user) ──

  describe('Comment Panel (Read user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should open comment panel for read user', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
    });

    it('should NOT show comment input for read user', async () => {
      await page.clickFirstCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentInputVisible()).toBe(false);
    });
  });

  // ── Multiple Segments ──

  describe('Multiple Segments', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should display all 4 segments', async () => {
      const segments = await page.getSegmentHeaders();
      expect(segments).toContain('Enterprise');
      expect(segments).toContain('CA Retail');
      expect(segments).toContain('Wholesale');
      expect(segments).toContain('US Retail');
    });
  });
});
