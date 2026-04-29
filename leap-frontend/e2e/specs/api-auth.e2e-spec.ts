import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs } from '../helpers/mock-auth.helper';
import { WelcomePage } from '../pages/welcome.po';
import { MOCK_USERS } from '../config/test-config';

describe('API Authorization Tests', () => {
  let driver: WebDriver;
  let welcome: WelcomePage;

  beforeAll(async () => {
    driver = await getDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  beforeEach(async () => {
    await resetToAnonymous(driver);
    welcome = new WelcomePage(driver);
    await welcome.waitForPage();
  });

  // --- Anonymous user ---

  describe('Not logged in', () => {
    it('should show "Please log in" when clicking admin-only API link', async () => {
      await welcome.clickApiTestLink(0); // admin-only
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Please log in');
    });

    it('should show "Please log in" when clicking write-only API link', async () => {
      // Wait for previous toast to disappear
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(1); // write-only
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Please log in');
    });

    it('should show "Please log in" when clicking read-only API link', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(2); // read-only
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Please log in');
    });
  });

  // --- Admin user ---

  describe('Admin user (GRP_ADMIN)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.ADMIN);
      await welcome.waitForPage();
    });

    it('should succeed on admin-only API', async () => {
      await welcome.clickApiTestLink(0);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Successfully accessed');
    });

    it('should fail on write-only API (lacks GRP_WRITE)', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(1);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });

    it('should fail on read-only API (lacks GRP_READ)', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(2);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });
  });

  // --- Write user ---

  describe('Write user (GRP_WRITE)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.WRITE);
      await welcome.waitForPage();
    });

    it('should fail on admin-only API', async () => {
      await welcome.clickApiTestLink(0);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });

    it('should succeed on write-only API', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(1);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Successfully accessed');
    });

    it('should fail on read-only API (lacks GRP_READ)', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(2);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });
  });

  // --- Read user ---

  describe('Read user (GRP_READ)', () => {
    beforeEach(async () => {
      await mockLoginAs(driver, MOCK_USERS.READ);
      await welcome.waitForPage();
    });

    it('should fail on admin-only API', async () => {
      await welcome.clickApiTestLink(0);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });

    it('should fail on write-only API', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(1);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Access denied');
    });

    it('should succeed on read-only API', async () => {
      await welcome.waitForToastToDisappear();
      await welcome.clickApiTestLink(2);
      const msg = await welcome.waitForToastMessage();
      expect(msg).toContain('Successfully accessed');
    });
  });
});
