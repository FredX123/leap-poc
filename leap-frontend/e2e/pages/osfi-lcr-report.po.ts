import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { TIMEOUT, humanDelay } from '../config/test-config';

/**
 * Page object for the OSFI LCR Report page.
 */
export class OsfiLcrReportPage {

  constructor(private driver: WebDriver) {}

  // --- Waits ---

  async waitForPage(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('h2')), TIMEOUT
    );
    const h2 = await this.driver.findElement(By.css('h2'));
    await this.driver.wait(async () => {
      const text = await h2.getText();
      return text.includes('OSFI LCR Report');
    }, TIMEOUT);
  }

  async waitForTable(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('.lcr-table')), TIMEOUT
    );
  }

  async waitForSpinner(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('.spinner-border')), TIMEOUT
    );
  }

  async waitForSpinnerToDisappear(): Promise<void> {
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('.spinner-border'));
      return els.length === 0;
    }, TIMEOUT);
  }

  // --- Form actions ---

  async setStartDate(date: string): Promise<void> {
    const input = await this.driver.wait(
      until.elementLocated(By.id('startDate')), TIMEOUT
    );
    await humanDelay(this.driver);
    await input.clear();
    await this.driver.executeScript(
      `arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input'));`,
      input, date
    );
  }

  async setEndDate(date: string): Promise<void> {
    const input = await this.driver.wait(
      until.elementLocated(By.id('endDate')), TIMEOUT
    );
    await humanDelay(this.driver);
    await input.clear();
    await this.driver.executeScript(
      `arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input'));`,
      input, date
    );
  }

  async clickViewAnalytics(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('button[type="submit"]')), TIMEOUT
    );
    await humanDelay(this.driver);
    await btn.click();
  }

  async isViewAnalyticsDisabled(): Promise<boolean> {
    const btn = await this.driver.findElement(By.css('button[type="submit"]'));
    const disabled = await btn.getAttribute('disabled');
    return disabled === 'true';
  }

  // --- Table queries ---

  async getPageHeadingText(): Promise<string> {
    const el = await this.driver.findElement(By.css('h2'));
    return el.getText();
  }

  async isTableVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.lcr-table'));
    return els.length > 0;
  }

  async getEmptyStateText(): Promise<string> {
    const el = await this.driver.findElement(By.css('.text-muted'));
    return el.getText();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.container-fluid > .text-muted.mt-3'));
    return els.length > 0;
  }

  /** Returns segment header names from the first header row. */
  async getSegmentHeaders(): Promise<string[]> {
    const headers = await this.driver.findElements(By.css('.segment-header'));
    const texts: string[] = [];
    for (const h of headers) {
      texts.push((await h.getText()).trim());
    }
    return texts;
  }

  /** Returns date column headers (e.g. "Jan-29", "Jan-30"). */
  async getDateHeaders(): Promise<string[]> {
    const headers = await this.driver.findElements(By.css('.date-header'));
    const texts: string[] = [];
    for (const h of headers) {
      const text = (await h.getText()).trim();
      if (text && text !== 'Variance') {
        texts.push(text);
      }
    }
    return texts;
  }

  /** Returns the number of visible data rows in the table body. */
  async getVisibleRowCount(): Promise<number> {
    const rows = await this.driver.findElements(By.css('.lcr-table tbody tr'));
    return rows.length;
  }

  /** Returns the name text of the first visible row. */
  async getFirstRowName(): Promise<string> {
    const cell = await this.driver.findElement(By.css('.lcr-table tbody tr .name-cell'));
    return (await cell.getText()).trim();
  }

  /** Returns all visible row names. */
  async getVisibleRowNames(): Promise<string[]> {
    const cells = await this.driver.findElements(By.css('.lcr-table tbody tr .name-cell'));
    const names: string[] = [];
    for (const cell of cells) {
      names.push((await cell.getText()).trim());
    }
    return names;
  }

  /** Returns true if any row has a level-1 CSS class. */
  async hasLevel1Rows(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.lcr-table tbody tr.level-1-row'));
    return els.length > 0;
  }

  /** Returns true if any row has a level-2 CSS class. */
  async hasLevel2Rows(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.lcr-table tbody tr.level-2-row'));
    return els.length > 0;
  }

  // --- Tree expand/collapse ---

  /** Click on the first expandable row name to toggle it. */
  async clickFirstExpandableRow(): Promise<void> {
    const clickable = await this.driver.findElement(By.css('.name-cell.clickable'));
    await humanDelay(this.driver);
    await clickable.click();
  }

  /** Returns the number of expand/collapse toggle icons visible. */
  async getToggleIconCount(): Promise<number> {
    const icons = await this.driver.findElements(By.css('.toggle-icon'));
    return icons.length;
  }

  /** Returns true if any expand icons (plus-square) are visible. */
  async hasExpandIcons(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-plus-square'));
    return els.length > 0;
  }

  /** Returns true if any collapse icons (dash-square) are visible. */
  async hasCollapseIcons(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-dash-square'));
    return els.length > 0;
  }

  // --- Amount cells ---

  /** Returns the text of the first amount cell. */
  async getFirstAmountCellText(): Promise<string> {
    const cell = await this.driver.findElement(By.css('.amount-cell'));
    return (await cell.getText()).trim();
  }

  /** Returns true if any variance cells have text. */
  async hasVarianceValues(): Promise<boolean> {
    const cells = await this.driver.findElements(By.css('.variance-cell'));
    for (const cell of cells) {
      const text = (await cell.getText()).trim();
      if (text) return true;
    }
    return false;
  }

  /** Returns true if any variance arrow icons are present. */
  async hasVarianceArrows(): Promise<boolean> {
    const up = await this.driver.findElements(By.css('.variance-cell .bi-arrow-up'));
    const down = await this.driver.findElements(By.css('.variance-cell .bi-arrow-down'));
    return up.length > 0 || down.length > 0;
  }

  // --- Comment icons ---

  /** Returns the number of comment icons in the table. */
  async getCommentIconCount(): Promise<number> {
    const icons = await this.driver.findElements(By.css('.action-cell .bi-chat-left-text'));
    return icons.length;
  }

  /** Click the comment icon on the first visible row (first segment). */
  async clickFirstCommentIcon(): Promise<void> {
    const icon = await this.driver.findElement(By.css('.action-cell .icon-wrapper'));
    await humanDelay(this.driver);
    await icon.click();
  }

  // --- Comment panel ---

  async isCommentPanelOpen(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.comment-panel.open'));
    return els.length > 0;
  }

  async waitForCommentPanel(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('.comment-panel.open')), TIMEOUT
    );
  }

  async closeCommentPanel(): Promise<void> {
    const btn = await this.driver.findElement(
      By.css('.comment-panel .btn-outline-secondary')
    );
    await humanDelay(this.driver);
    await btn.click();
    // Wait for panel to close
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('.comment-panel.open'));
      return els.length === 0;
    }, TIMEOUT);
  }

  async getCommentPanelTitle(): Promise<string> {
    const el = await this.driver.wait(
      until.elementLocated(By.id('comment-panel-title')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(el), TIMEOUT);
    return (await el.getText()).trim();
  }

  /** Returns true if the comment input textarea is visible in the panel. */
  async isCommentInputVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.comment-panel .panel-footer'));
    return els.length > 0;
  }

  // --- Alert messages ---

  async isAlertVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.alert'));
    return els.length > 0;
  }

  async getAlertText(): Promise<string> {
    const el = await this.driver.findElement(By.css('.alert'));
    return (await el.getText()).trim();
  }

  /** Returns the header title text (e.g. "Enterprise LCR"). */
  async getTableHeaderTitle(): Promise<string> {
    const el = await this.driver.findElement(By.css('.header-title'));
    return (await el.getText()).trim();
  }

  /** Returns the header subtitle text (e.g. "(Amount in Billions CAD)"). */
  async getTableHeaderSubtitle(): Promise<string> {
    const el = await this.driver.findElement(By.css('.header-subtitle'));
    return (await el.getText()).trim();
  }
}
