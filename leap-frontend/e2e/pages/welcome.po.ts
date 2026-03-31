import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT } from '../config/test-config';

/**
 * Page object for the Welcome (home) page.
 */
export class WelcomePage {

  constructor(private driver: WebDriver) {}

  async waitForPage(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.css('h1.display-4')), TIMEOUT);
  }

  async getTitleText(): Promise<string> {
    const el = await this.driver.findElement(By.css('h1.display-4'));
    return el.getText();
  }

  /** Returns true if the anonymous description paragraph is visible. */
  async isAnonymousContentVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.xpath("//p[contains(text(),'proof-of-concept demonstrates')]")
    );
    return els.length > 0;
  }

  /** Returns true if the authenticated welcome alert is visible. */
  async isWelcomeAlertVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.alert-success'));
    return els.length > 0;
  }

  async waitForWelcomeAlert(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.css('.alert-success')), TIMEOUT);
  }

  async waitForWelcomeAlertAbsent(): Promise<void> {
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('.alert-success'));
      return els.length === 0;
    }, TIMEOUT);
  }

  /** Returns the welcome heading text (e.g. "Welcome, POC Admin 1! Mock"). */
  async getWelcomeHeadingText(): Promise<string> {
    const el = await this.driver.wait(
      until.elementLocated(By.css('.alert-success .alert-heading')), TIMEOUT
    );
    return el.getText();
  }

  /** Returns the list of displayed role/group names in the welcome alert. */
  async getDisplayedRolesAndGroups(): Promise<string[]> {
    const items = await this.driver.findElements(By.css('.alert-success ul li'));
    const texts: string[] = [];
    for (const item of items) {
      texts.push((await item.getText()).trim());
    }
    return texts;
  }

  async getApiTestLinkCount(): Promise<number> {
    const links = await this.driver.findElements(By.css('.card .list-group-item a'));
    return links.length;
  }

  /** Click an API test link by index (0-based). */
  async clickApiTestLink(index: number): Promise<void> {
    const links = await this.driver.findElements(By.css('.card .list-group-item a'));
    if (index < links.length) {
      await links[index].click();
    }
  }

  /** Wait for and return the toast alert message text. */
  async waitForToastMessage(): Promise<string> {
    const el = await this.driver.wait(
      until.elementLocated(By.css('.container .alert-dismissible')), TIMEOUT
    );
    return el.getText();
  }

  /** Returns true if a toast alert is visible. */
  async isToastVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.container .alert-dismissible'));
    return els.length > 0;
  }
}
