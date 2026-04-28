import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { HeaderPage } from '../pages/header.po';
import { OsfiLcrMetricReportPage } from '../pages/osfi-lcr-metric-report.po';
import { AccessDeniedPage } from '../pages/access-denied.po';
import { BASE_URL, MOCK_USERS, pause, TIMEOUT } from '../config/test-config';

describe('OSFI LCR Metric Report', () => {
  let driver: WebDriver;
  let page: OsfiLcrMetricReportPage;
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
    page = new OsfiLcrMetricReportPage(driver);
  });

  // ── Access Control ──

  describe('Access Control', () => {
    it('should trigger login redirect for anonymous user', async () => {
      await driver.get(BASE_URL + '/osfi-lcr-metric-report');
      // Guard calls auth.login() which redirects to /oauth2/authorization/entra
      await driver.wait(async () => {
        const url = await driver.getCurrentUrl();
        return !url.includes('/osfi-lcr-metric-report');
      }, TIMEOUT);
      const url = await driver.getCurrentUrl();
      expect(url).not.toContain('/osfi-lcr-metric-report');
    });

    it('should allow read-role user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Metric Report');
    });

    it('should allow write-role user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Metric Report');
    });

    it('should allow write-group user to access the page', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_GROUP);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Metric Report');
    });

    it('should redirect admin-only user to access-denied', async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      const denied = new AccessDeniedPage(driver);
      await denied.waitForPage();
      expect(await denied.isAccessDeniedVisible()).toBe(true);
    });
  });

  // ── Initial State ──

  describe('Initial State', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
    });

    it('should display the page heading', async () => {
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Metric Report');
    });

    it('should show empty state message before search', async () => {
      expect(await page.isEmptyStateVisible()).toBe(true);
      const text = await page.getEmptyStateText();
      expect(text).toContain('View Analytics');
    });

    it('should not show the data table before search', async () => {
      expect(await page.isTableVisible()).toBe(false);
    });

    it('should have a segment dropdown with 4 options', async () => {
      const options = await page.getSegmentOptions();
      expect(options.length).toBe(4);
      expect(options).toContain('Enterprise');
      expect(options).toContain('CA Retail');
      expect(options).toContain('US Retail');
      expect(options).toContain('Wholesale');
    });

    it('should default to Enterprise segment', async () => {
      const selected = await page.getSelectedSegment();
      expect(selected).toBe('Enterprise');
    });
  });

  // ── Navigation ──

  describe('Navigation', () => {
    it('should navigate to LCR Metric report via nav link', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await header.clickNavLink('OSFI LCR Metric');
      await page.waitForPage();
      const heading = await page.getPageHeadingText();
      expect(heading).toContain('OSFI LCR Metric Report');
    });
  });

  // ── Data Loading ──

  describe('Data Loading', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
    });

    it('should load and display data after submitting', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.isTableVisible()).toBe(true);
      expect(await page.getVisibleRowCount()).toBeGreaterThan(0);
    });

    it('should display Weighted and Unweighted group headers', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const groups = await page.getGroupHeaders();
      expect(groups.length).toBe(2);
      expect(groups.some(g => g.includes('Weighted'))).toBe(true);
      expect(groups.some(g => g.includes('Unweighted'))).toBe(true);
    });

    it('should include segment name in group headers', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const groups = await page.getGroupHeaders();
      expect(groups[0]).toContain('Enterprise');
      expect(groups[1]).toContain('Enterprise');
    });

    it('should show the table header title with segment name', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const title = await page.getTableHeaderTitle();
      expect(title).toContain('Enterprise');
      expect(title).toContain('LCR Metric');
    });

    it('should display amount values', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.hasAmountValues()).toBe(true);
    });

    it('should display variance values', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.hasVarianceValues()).toBe(true);
    });

    it('should hide empty state after data loads', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();

      expect(await page.isEmptyStateVisible()).toBe(false);
    });
  });

  // ── Segment Selection ──

  describe('Segment Selection', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
    });

    it('should load CA Retail data when selected', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('CA Retail');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const groups = await page.getGroupHeaders();
      expect(groups[0]).toContain('CA Retail');
    });

    it('should load Wholesale data when selected', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Wholesale');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const title = await page.getTableHeaderTitle();
      expect(title).toContain('Wholesale');
    });

    it('should load US Retail data when selected', async () => {
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('US Retail');
      await page.clickViewAnalytics();
      await page.waitForTable();

      const title = await page.getTableHeaderTitle();
      expect(title).toContain('US Retail');
    });
  });

  // ── Tree Hierarchy ──

  describe('Tree Hierarchy', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should display level-1 parent rows', async () => {
      expect(await page.hasLevel1Rows()).toBe(true);
    });

    it('should have expandable rows with toggle icons', async () => {
      expect(await page.hasExpandIcons()).toBe(true);
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
  });

  // ── Comment Panel (Write user) ──

  describe('Comment Panel (Write user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should display comment icons on rows', async () => {
      const iconCount = await page.getCommentIconCount();
      expect(iconCount).toBeGreaterThan(0);
    });

    it('should open comment panel when clicking Weighted comment icon', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
    });

    it('should open comment panel when clicking Unweighted comment icon', async () => {
      await page.clickFirstUnweightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
    });

    it('should show Comments title in the panel', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      const title = await page.getCommentPanelTitle();
      expect(title).toContain('Comments');
    });

    it('should show comment input for write user', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentInputVisible()).toBe(true);
    });

    it('should close comment panel', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      await page.closeCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(false);
    });

    it('should be able to open Weighted then Unweighted panels separately', async () => {
      // Open Weighted
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
      await page.closeCommentPanel();

      // Open Unweighted
      await page.clickFirstUnweightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
      await page.closeCommentPanel();
    });
  });

  // ── Comment Panel (Read user) ──

  describe('Comment Panel (Read user)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/osfi-lcr-metric-report');
      await page.waitForPage();
      await page.setStartDate(START_DATE);
      await page.setEndDate(END_DATE);
      await page.selectSegment('Enterprise');
      await page.clickViewAnalytics();
      await page.waitForTable();
    });

    it('should open comment panel for read user', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentPanelOpen()).toBe(true);
    });

    it('should NOT show comment input for read user', async () => {
      await page.clickFirstWeightedCommentIcon();
      await page.waitForCommentPanel();
      expect(await page.isCommentInputVisible()).toBe(false);
    });
  });
});
