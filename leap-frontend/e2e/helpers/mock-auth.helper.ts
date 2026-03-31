import { WebDriver } from 'selenium-webdriver';
import { HeaderPage } from '../pages/header.po';
import { BASE_URL } from '../config/test-config';

/** Navigate to home and clear cookies to start fresh as anonymous. */
export async function resetToAnonymous(driver: WebDriver): Promise<void> {
  await driver.manage().deleteAllCookies();
  await driver.get(BASE_URL);
  const header = new HeaderPage(driver);
  await header.waitForNavbar();
}

/** Mock-login as the given user via the UI toggle + dropdown. */
export async function mockLoginAs(driver: WebDriver, username: string): Promise<void> {
  const header = new HeaderPage(driver);
  await header.enableMockToggle();
  await header.selectMockUser(username);
  await header.waitUntilAuthenticated();
}

/** Mock-logout via the logout button, then wait for anonymous state. */
export async function mockLogout(driver: WebDriver): Promise<void> {
  const header = new HeaderPage(driver);
  await header.clickLogout();
  await header.waitUntilAnonymous();
}

/** Navigate to a path relative to BASE_URL and wait for navbar. */
export async function navigateTo(driver: WebDriver, path: string): Promise<void> {
  await driver.get(BASE_URL + path);
  const header = new HeaderPage(driver);
  await header.waitForNavbar();
}
