import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT } from '../config/test-config';

/**
 * Page object for the Access Denied page.
 */
export class AccessDeniedPage {

  constructor(private driver: WebDriver) {}

  async waitForPage(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Access Denied')]")), TIMEOUT
    );
  }

  async isAccessDeniedVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.xpath("//h2[contains(text(),'Access Denied')]")
    );
    return els.length > 0;
  }

  async isShieldIconVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-shield-exclamation'));
    return els.length > 0;
  }

  /** Click the "Back to Home" link. */
  async clickBackToHome(): Promise<void> {
    const link = await this.driver.findElement(By.css('a[href="/"]'));
    await link.click();
  }
}
