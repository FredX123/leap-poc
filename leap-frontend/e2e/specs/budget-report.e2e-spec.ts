import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { BudgetReportPage } from '../pages/budget-report.po';
import { MOCK_USERS } from '../config/test-config';

describe('Budget Report', () => {
  let driver: WebDriver;
  let budgetPage: BudgetReportPage;

  beforeAll(async () => {
    driver = await getDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  // --- Write role user (APP_WRITE) ---

  describe('Write user (APP_WRITE)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should display budget table with data rows', async () => {
      expect(await budgetPage.isTablePresent()).toBe(true);
      expect(await budgetPage.getRowCount()).toBeGreaterThan(0);
    });

    it('should show edit buttons for write user', async () => {
      expect(await budgetPage.areEditButtonsVisible()).toBe(true);
    });

    it('should enter edit mode when clicking edit', async () => {
      await budgetPage.clickEditOnRow(0);
      expect(await budgetPage.isInEditMode()).toBe(true);
    });

    it('should cancel edit mode', async () => {
      await budgetPage.clickEditOnRow(0);
      expect(await budgetPage.isInEditMode()).toBe(true);
      await budgetPage.clickCancelEdit();
      expect(await budgetPage.isInEditMode()).toBe(false);
    });

    it('should show comment buttons on all rows', async () => {
      expect(await budgetPage.areCommentButtonsVisible()).toBe(true);
    });
  });

  // --- Read role user (APP_READ) ---

  describe('Read user (APP_READ)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should display budget table with data rows', async () => {
      expect(await budgetPage.isTablePresent()).toBe(true);
      expect(await budgetPage.getRowCount()).toBeGreaterThan(0);
    });

    it('should NOT show edit buttons for read-only user', async () => {
      expect(await budgetPage.areEditButtonsVisible()).toBe(false);
    });

    it('should show comment buttons on all rows', async () => {
      expect(await budgetPage.areCommentButtonsVisible()).toBe(true);
    });
  });

  // --- Write group user (GRP_WRITE) ---

  describe('Write group user (GRP_WRITE)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.WRITE_GROUP);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should display budget table with data rows', async () => {
      expect(await budgetPage.isTablePresent()).toBe(true);
      expect(await budgetPage.getRowCount()).toBeGreaterThan(0);
    });

    it('should show edit buttons for group-based write user', async () => {
      expect(await budgetPage.areEditButtonsVisible()).toBe(true);
    });

    it('should show comment buttons on all rows', async () => {
      expect(await budgetPage.areCommentButtonsVisible()).toBe(true);
    });
  });

  // --- Read group user (GRP_READ) ---

  describe('Read group user (GRP_READ)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.READ_GROUP);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should display budget table with data rows', async () => {
      expect(await budgetPage.isTablePresent()).toBe(true);
      expect(await budgetPage.getRowCount()).toBeGreaterThan(0);
    });

    it('should NOT show edit buttons for group-based read user', async () => {
      expect(await budgetPage.areEditButtonsVisible()).toBe(false);
    });

    it('should show comment buttons on all rows', async () => {
      expect(await budgetPage.areCommentButtonsVisible()).toBe(true);
    });
  });
});
