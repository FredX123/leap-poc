import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { HeaderPage } from '../pages/header.po';
import { UserManagementPage } from '../pages/user-management.po';
import { AccessDeniedPage } from '../pages/access-denied.po';
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

  // --- Admin user (GRP_ADMIN) ---

  describe('Admin user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN);
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
  });

  // --- Write user (GRP_WRITE) ---

  describe('Write user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE);
    });

    it('should see OSFI LCR nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('OSFI LCR'))).toBe(true);
    });

    it('should NOT see User Management nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(false);
    });
  });

  // --- Read user (GRP_READ) ---

  describe('Read user', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ);
    });

    it('should see OSFI LCR nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('OSFI LCR'))).toBe(true);
    });

    it('should NOT see User Management nav link', async () => {
      const links = await header.getNavLinkTexts();
      expect(links.some(t => t.includes('User Management'))).toBe(false);
    });
  });

  // --- Access Denied ---

  describe('Access Denied', () => {
    it('should redirect read user to access-denied when navigating to /admin-only', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ);
      await navigateTo(driver, '/admin-only');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should redirect write user to access-denied when navigating to /user-management', async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE);
      await navigateTo(driver, '/user-management');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should redirect read user to access-denied when navigating to /write-only', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ);
      await navigateTo(driver, '/write-only');
      const page = new AccessDeniedPage(driver);
      await page.waitForPage();
      expect(await page.isAccessDeniedVisible()).toBe(true);
    });

    it('should allow navigating back to home from access-denied page', async () => {
      await mockLoginAs(driver, MOCK_USERS.READ);
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
