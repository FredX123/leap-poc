import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT, humanDelay } from '../config/test-config';

/**
 * Page object for the OSFI LCR Metric Report page.
 */
export class OsfiLcrMetricReportPage {

  constructor(private driver: WebDriver) {}

  // --- Waits ---

  async waitForPage(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('h2')), TIMEOUT
    );
    const h2 = await this.driver.findElement(By.css('h2'));
    await this.driver.wait(async () => {
      const text = await h2.getText();
      return text.includes('OSFI LCR Metric Report');
    }, TIMEOUT);
  }

  async waitForTable(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.css('.lcr-table')), TIMEOUT
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

  async selectSegment(segment: string): Promise<void> {
    const select = await this.driver.wait(
      until.elementLocated(By.id('segment')), TIMEOUT
    );
    await humanDelay(this.driver);
    await select.findElement(By.css(`option[value="${segment}"]`)).click();
  }

  async getSelectedSegment(): Promise<string> {
    const select = await this.driver.findElement(By.id('segment'));
    const option = await select.findElement(By.css('option:checked'));
    return (await option.getText()).trim();
  }

  /** Returns the list of available segment options. */
  async getSegmentOptions(): Promise<string[]> {
    const options = await this.driver.findElements(By.css('#segment option'));
    const texts: string[] = [];
    for (const opt of options) {
      texts.push((await opt.getText()).trim());
    }
    return texts;
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

  async isEmptyStateVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.container-fluid > .text-muted.mt-3'));
    return els.length > 0;
  }

  async getEmptyStateText(): Promise<string> {
    const el = await this.driver.findElement(By.css('.text-muted'));
    return el.getText();
  }

  /** Returns the two group headers: "Weighted" and "Unweighted". */
  async getGroupHeaders(): Promise<string[]> {
    const headers = await this.driver.findElements(By.css('.segment-header'));
    const texts: string[] = [];
    for (const h of headers) {
      texts.push((await h.getText()).trim());
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

  // --- Tree expand/collapse ---

  /** Click on the first expandable row name to toggle it. */
  async clickFirstExpandableRow(): Promise<void> {
    const clickable = await this.driver.findElement(By.css('.name-cell.clickable'));
    await humanDelay(this.driver);
    await clickable.click();
  }

  async hasExpandIcons(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-plus-square'));
    return els.length > 0;
  }

  async hasCollapseIcons(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-dash-square'));
    return els.length > 0;
  }

  // --- Amount cells ---

  /** Returns true if any amount cells have text. */
  async hasAmountValues(): Promise<boolean> {
    const cells = await this.driver.findElements(By.css('.amount-cell'));
    for (const cell of cells) {
      const text = (await cell.getText()).trim();
      if (text) return true;
    }
    return false;
  }

  /** Returns true if any variance values are displayed. */
  async hasVarianceValues(): Promise<boolean> {
    const cells = await this.driver.findElements(By.css('.variance-cell'));
    for (const cell of cells) {
      const text = (await cell.getText()).trim();
      if (text) return true;
    }
    return false;
  }

  // --- Comment icons ---

  /** Returns the number of comment icons in the table. */
  async getCommentIconCount(): Promise<number> {
    const icons = await this.driver.findElements(By.css('.action-cell .bi-chat-left-text'));
    return icons.length;
  }

  /** Click the first comment icon (Weighted column of first row). */
  async clickFirstWeightedCommentIcon(): Promise<void> {
    const wrappers = await this.driver.findElements(By.css('.action-cell .icon-wrapper'));
    // First icon-wrapper per row is Weighted comment
    if (wrappers.length > 0) {
      await humanDelay(this.driver);
      await wrappers[0].click();
    }
  }

  /** Click the first Unweighted comment icon (second comment icon of first row). */
  async clickFirstUnweightedCommentIcon(): Promise<void> {
    const wrappers = await this.driver.findElements(By.css('.action-cell .icon-wrapper'));
    // Icons per row: W-comment, W-adjustment, U-comment, U-adjustment
    // So index 2 is the first U-comment icon
    if (wrappers.length > 2) {
      await humanDelay(this.driver);
      await wrappers[2].click();
    }
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

  /** Returns the header title text (e.g. "Enterprise LCR Metric"). */
  async getTableHeaderTitle(): Promise<string> {
    const el = await this.driver.findElement(By.css('.header-title'));
    return (await el.getText()).trim();
  }
}
