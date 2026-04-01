import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { HeaderPage } from '../pages/header.po';
import { UserManagementPage } from '../pages/user-management.po';
import { AccessDeniedPage } from '../pages/access-denied.po';
import { BudgetReportPage } from '../pages/budget-report.po';
import { MOCK_USERS } from '../config/test-config';

describe('Navigation & RBAC', () => {
  let driver: WebDriver;
  let header: HeaderPage;

  beforeAll(async () => {
    driver = await getDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  beforeEach(async () => {
    await resetToAnonymous(driver);
    header = new HeaderPage(driver);
  });

  // --- Admin role user (APP_ADMIN) ---

  describe('Admin role user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    });

    it('should see User Management nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(true);
    });

    it('should see Guarded [Admin] nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Guarded [Admin]'))).toBe(true);
    });

    it('should navigate to User Management page', async () => {
      await header.clickNavLink('User Management');
      const page = new UserManagementPage(driver);
      await page.waitForPage();
      expect(await page.isPageHeadingPresent()).toBe(true);
    });

    it('should NOT see Budget Report nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Budget Report'))).toBe(false);
    });
  });

  // --- Admin group user (GRP_ADMIN) ---

  describe('Admin group user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN_GROUP);
    });

    it('should see User Management nav link (group-based)', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(true);
    });
  });

  // --- Write role user (APP_WRITE) ---

  describe('Write role user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
    });

    it('should see Budget Report nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Budget Report'))).toBe(true);
    });

    it('should NOT see User Management nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(false);
    });

    it('should navigate to Budget Report page', async () => {
      await header.clickNavLink('Budget Report');
      const page = new BudgetReportPage(driver);
      await page.waitForPage();
      expect(await page.isTablePresent()).toBe(true);
    });
  });

  // --- Write group user (GRP_WRITE) ---

  describe('Write group user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_GROUP);
    });

    it('should see Budget Report nav link (group-based)', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Budget Report'))).toBe(true);
    });
  });

  // --- Read role user (APP_READ) ---

  describe('Read role user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
    });

    it('should see Budget Report nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Budget Report'))).toBe(true);
    });

    it('should NOT see User Management nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(false);
    });

    it('should navigate to Budget Report page', async () => {
      await header.clickNavLink('Budget Report');
      const page = new BudgetReportPage(driver);
      await page.waitForPage();
      expect(await page.isTablePresent()).toBe(true);
    });
  });

  // --- Read group user (GRP_READ) ---

  describe('Read group user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_GROUP);
    });

    it('should see Budget Report nav link (group-based)', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('Budget Report'))).toBe(true);
    });
  });

  // --- Access Denied ---

  describe('Access Denied', () => {
    it('should redirect read user to access-denied when navigating to /admin-only', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/admin-only');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should redirect write user to access-denied when navigating to /user-management', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/user-management');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should redirect read user to access-denied when navigating to /write-only', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/write-only');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should allow navigating back to home from access-denied page', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/admin-only');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      await page.clickBackToHome();

      header = new HeaderPage(driver);
      await header.waitForNavbar();
      // Should be back on welcome page (URL is /)
      const url = await driver.getCurrentUrl();
      expect(url.endsWith('/')).toBe(true);
    });
  });
});
