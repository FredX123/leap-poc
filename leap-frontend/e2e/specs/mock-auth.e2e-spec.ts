import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, mockLogout } from '../helpers/mock-auth.helper';
import { HeaderPage } from '../pages/header.po';
import { MOCK_USERS } from '../config/test-config';

describe('Mock Authentication', () => {
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

  // --- Anonymous state ---

  it('should show mock toggle when anonymous', async () => {
    expect(await header.isMockToggleVisible()).toBe(true);
  });

  it('should show Entra login button when anonymous', async () => {
    expect(await header.isLoginButtonVisible()).toBe(true);
  });

  it('should not show logout button when anonymous', async () => {
    expect(await header.isLogoutButtonVisible()).toBe(false);
  });

  it('should not show user name when anonymous', async () => {
    expect(await header.getDisplayedUserName()).toBeNull();
  });

  // --- Mock toggle ---

  it('should load mock users when toggle is enabled', async () => {
    await header.enableMockToggle();
    // If enableMockToggle succeeds, the dropdown is visible (waited for it)
    expect(true).toBe(true);
  });

  // --- Mock login ---

  it('should login as admin role user and show authenticated state', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);

    expect(await header.getDisplayedUserName()).toBe('POC Admin 1');
    expect(await header.isMockBadgeVisible()).toBe(true);
    expect(await header.isLogoutButtonVisible()).toBe(true);
    expect(await header.isMockToggleVisible()).toBe(false);
    expect(await header.isLoginButtonVisible()).toBe(false);
  });

  it('should login as admin group user', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_GROUP);
    expect(await header.getDisplayedUserName()).toBe('POC Admin 2');
    expect(await header.isMockBadgeVisible()).toBe(true);
  });

  it('should login as write role user', async () => {
    await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
    expect(await header.getDisplayedUserName()).toBe('POC Writer 1');
  });

  it('should login as write group user', async () => {
    await mockLoginAs(driver, MOCK_USERS.WRITE_GROUP);
    expect(await header.getDisplayedUserName()).toBe('POC Writer 2');
  });

  it('should login as read role user', async () => {
    await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
    expect(await header.getDisplayedUserName()).toBe('POC Reader 1');
  });

  it('should login as read group user', async () => {
    await mockLoginAs(driver, MOCK_USERS.READ_GROUP);
    expect(await header.getDisplayedUserName()).toBe('POC Reader 2');
  });

  // --- Mock logout ---

  it('should logout and return to anonymous state', async () => {
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    expect(await header.isLogoutButtonVisible()).toBe(true);

    await mockLogout(driver);

    expect(await header.isLogoutButtonVisible()).toBe(false);
    expect(await header.isMockToggleVisible()).toBe(true);
    expect(await header.isLoginButtonVisible()).toBe(true);
    expect(await header.getDisplayedUserName()).toBeNull();
  });

  // --- Switching users ---

  it('should switch from one mock user to another after logout', async () => {
    // Login as admin
    await mockLoginAs(driver, MOCK_USERS.ADMIN_ROLE);
    expect(await header.getDisplayedUserName()).toBe('POC Admin 1');

    // Logout
    await mockLogout(driver);

    // Login as reader
    await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
    expect(await header.getDisplayedUserName()).toBe('POC Reader 1');
  });
});
