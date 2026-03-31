import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, mockLogout } from '../helpers/mock-auth.helper';
import { WelcomePage } from '../pages/welcome.po';
import { MOCK_USERS } from '../config/test-config';

describe('Welcome Page', () => {
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
  });

  // --- Page structure ---

  it('should display the LEAP POC title', async () => {
    await welcome.waitForPage();
    const title = await welcome.getTitleText();
    expect(title).toContain('LEAP POC');
  });

  it('should show 3 API test links', async () => {
    await welcome.waitForPage();
    expect(await welcome.getApiTestLinkCount()).toBe(3);
  });

  // --- Anonymous state ---

  it('should show anonymous description when not logged in', async () => {
    await welcome.waitForPage();
    expect(await welcome.isAnonymousContentVisible()).toBe(true);
    expect(await welcome.isWelcomeAlertVisible()).toBe(false);
  });

  // --- After mock login ---

  it('should show welcome alert with user name after login', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    await welcome.waitForWelcomeAlert();

    const heading = await welcome.getWelcomeHeadingText();
    expect(heading).toContain('Welcome, POC Admin 1!');
    expect(await welcome.isAnonymousContentVisible()).toBe(false);
  });

  it('should display roles in the welcome alert for role-based user', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    await welcome.waitForWelcomeAlert();

    const rolesAndGroups = await welcome.getDisplayedRolesAndGroups();
    expect(rolesAndGroups).toContain('APP_ADMIN');
  });

  it('should display groups in the welcome alert for group-based user', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_GROUP);
    await welcome.waitForWelcomeAlert();

    const rolesAndGroups = await welcome.getDisplayedRolesAndGroups();
    expect(rolesAndGroups).toContain('GRP_ADMIN');
  });

  it('should show Mock badge in welcome heading', async () => {
    await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
    await welcome.waitForWelcomeAlert();

    const heading = await welcome.getWelcomeHeadingText();
    expect(heading).toContain('Mock');
  });

  // --- Reactivity: switching users ---

  it('should update welcome reactively when switching to a different user', async () => {
    // Login as admin
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    await welcome.waitForWelcomeAlert();
    let heading = await welcome.getWelcomeHeadingText();
    expect(heading).toContain('POC Admin 1');

    // Logout
    await mockLogout(driver);
    await welcome.waitForWelcomeAlertAbsent();
    expect(await welcome.isAnonymousContentVisible()).toBe(true);

    // Login as reader
    await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
    await welcome.waitForWelcomeAlert();
    heading = await welcome.getWelcomeHeadingText();
    expect(heading).toContain('POC Reader 1');
  });

  // --- After logout ---

  it('should remove welcome alert and show anonymous content after logout', async () => {
    await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
    await welcome.waitForWelcomeAlert();

    await mockLogout(driver);
    await welcome.waitForWelcomeAlertAbsent();

    expect(await welcome.isWelcomeAlertVisible()).toBe(false);
    expect(await welcome.isAnonymousContentVisible()).toBe(true);
  });
});
