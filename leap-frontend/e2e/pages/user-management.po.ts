import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT } from '../config/test-config';

/**
 * Page object for the User Management page (admin-only).
 */
export class UserManagementPage {

  constructor(private driver: WebDriver) {}

  async waitForPage(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'User Management')]")), TIMEOUT
    );
  }

  async isPageHeadingPresent(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.xpath("//h2[contains(text(),'User Management')]")
    );
    return els.length > 0;
  }

  async getInfoAlertText(): Promise<string> {
    const el = await this.driver.findElement(By.css('.alert-info'));
    return el.getText();
  }
}
