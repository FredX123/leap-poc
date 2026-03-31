import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT } from '../config/test-config';

/**
 * Page object for the shared header / navbar component.
 */
export class HeaderPage {

  constructor(private driver: WebDriver) {}

  // --- Waits ---

  async waitForNavbar(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.css('nav.navbar')), TIMEOUT);
  }

  async waitUntilAuthenticated(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('button.btn-outline-warning')), TIMEOUT
    );
  }

  async waitUntilAnonymous(): Promise<void> {
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('button.btn-outline-warning'));
      return els.length === 0;
    }, TIMEOUT);
  }

  // --- Actions ---

  /** Turn on the "Mock Login" toggle switch. */
  async enableMockToggle(): Promise<void> {
    const toggle = await this.driver.wait(
      until.elementLocated(By.id('mockToggle')), TIMEOUT
    );
    const isSelected = await toggle.isSelected();
    if (!isSelected) {
      await toggle.click();
    }
    // Wait for the mock user dropdown to appear (API call to /api/mock/users)
    await this.driver.wait(
      until.elementLocated(By.css('.mock-user-select')), TIMEOUT
    );
  }

  /** Select a mock user from the dropdown by username value. */
  async selectMockUser(username: string): Promise<void> {
    const select = await this.driver.findElement(By.css('.mock-user-select'));
    await select.findElement(By.css(`option[value="${username}"]`)).click();
  }

  /** Click the logout button. */
  async clickLogout(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('button.btn-outline-warning')), TIMEOUT
    );
    await btn.click();
  }

  /** Click the brand link to navigate home. */
  async clickBrand(): Promise<void> {
    const brand = await this.driver.findElement(By.css('a.navbar-brand'));
    await brand.click();
  }

  // --- Queries ---

  /** Returns the displayed user name text (null if anonymous). */
  async getDisplayedUserName(): Promise<string | null> {
    const els = await this.driver.findElements(By.css('nav.navbar span.text-light'));
    if (els.length === 0) return null;
    const text = await els[0].getText();
    // Strip the "Mock" badge text if present
    return text.replace('Mock', '').trim();
  }

  async isMockBadgeVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.badge.bg-info'));
    return els.length > 0;
  }

  async isLogoutButtonVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('button.btn-outline-warning'));
    return els.length > 0;
  }

  async isMockToggleVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.id('mockToggle'));
    return els.length > 0;
  }

  async isLoginButtonVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('button.btn-outline-light'));
    return els.length > 0;
  }

  /** Returns the list of visible navigation link texts. */
  async getNavLinkTexts(): Promise<string[]> {
    const links = await this.driver.findElements(By.css('ul.navbar-nav a.nav-link'));
    const texts: string[] = [];
    for (const link of links) {
      texts.push((await link.getText()).trim());
    }
    return texts;
  }

  /** Click a navigation link by partial text match. */
  async clickNavLink(text: string): Promise<void> {
    const links = await this.driver.findElements(By.css('ul.navbar-nav a.nav-link'));
    for (const link of links) {
      const linkText = await link.getText();
      if (linkText.includes(text)) {
        await link.click();
        return;
      }
    }
    throw new Error(`Nav link not found: ${text}`);
  }
}
