import { By, until, WebDriver } from 'selenium-webdriver';
import { TIMEOUT } from '../config/test-config';

/**
 * Page object for the Budget Report page.
 */
export class BudgetReportPage {

  constructor(private driver: WebDriver) {}

  /** Wait for the page heading and table to finish loading. */
  async waitForPage(): Promise<void> {
    await this.driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(),'Budget Report')]")), TIMEOUT
    );
    // Wait for the spinner to disappear
    await this.driver.wait(async () => {
      const spinners = await this.driver.findElements(By.css('.spinner-border'));
      return spinners.length === 0;
    }, TIMEOUT);
  }

  async getRowCount(): Promise<number> {
    const rows = await this.driver.findElements(By.css('table.table-striped tbody tr'));
    return rows.length;
  }

  async isTablePresent(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('table.table-striped'));
    return els.length > 0;
  }

  /** Returns the item description of a row by index (0-based). */
  async getItemDescription(rowIndex: number): Promise<string | null> {
    const rows = await this.driver.findElements(By.css('table.table-striped tbody tr'));
    if (rowIndex >= rows.length) return null;
    const cells = await rows[rowIndex].findElements(By.css('td'));
    return cells.length > 1 ? cells[1].getText() : null;
  }

  /** Returns true if edit pencil buttons are visible (APP_WRITE only). */
  async areEditButtonsVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('button.btn-outline-primary .bi-pencil'));
    return els.length > 0;
  }

  /** Click the edit button on a row by index (0-based). */
  async clickEditOnRow(rowIndex: number): Promise<void> {
    const buttons = await this.driver.findElements(By.css('button.btn-outline-primary'));
    if (rowIndex < buttons.length) {
      await buttons[rowIndex].click();
    }
  }

  /** Returns true if save/cancel buttons are visible (edit mode). */
  async isInEditMode(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('button.btn-success .bi-check-lg'));
    return els.length > 0;
  }

  /** Click cancel to exit edit mode. */
  async clickCancelEdit(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('td button.btn-secondary')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(btn), TIMEOUT);
    await btn.click();
    // Wait for edit mode to actually exit (save button disappears)
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('button.btn-success .bi-check-lg'));
      return els.length === 0;
    }, TIMEOUT);
  }

  /** Returns true if comment buttons are visible on rows. */
  async areCommentButtonsVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.bi-chat-dots'));
    return els.length > 0;
  }

  /** Click the comment button on a row by index (0-based). */
  async openCommentPanel(rowIndex: number): Promise<void> {
    const rows = await this.driver.findElements(By.css('table.table-striped tbody tr'));
    if (rowIndex < rows.length) {
      const btn = await rows[rowIndex].findElement(By.css('button.btn-outline-secondary'));
      await btn.click();
    }
    await this.driver.wait(
      until.elementLocated(By.css('.comment-panel.open')), TIMEOUT
    );
  }

  async isCommentPanelOpen(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.comment-panel.open'));
    return els.length > 0;
  }

  /** Close the comment panel via its close button. */
  async closeCommentPanel(): Promise<void> {
    const panel = await this.driver.findElement(By.css('.comment-panel.open'));
    const btn = await panel.findElement(
      By.css('.panel-header button[aria-label="Close comments panel"]')
    );
    await this.driver.wait(until.elementIsVisible(btn), TIMEOUT);
    await btn.click();
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css('.comment-panel.open'));
      return els.length === 0;
    }, TIMEOUT);
  }

  /** Returns true if the comment text input is visible (user has write access). */
  async isCommentInputVisible(): Promise<boolean> {
    const els = await this.driver.findElements(By.css('.comment-panel .comment-input textarea'));
    return els.length > 0;
  }

  /** Type text into the comment input. */
  async typeComment(text: string): Promise<void> {
    const textarea = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-input textarea')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(textarea), TIMEOUT);
    await textarea.clear();
    await textarea.sendKeys(text);
  }

  /** Click the send button to submit a comment. */
  async submitComment(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-input button.btn-primary')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(btn), TIMEOUT);
    await btn.click();
  }

  /** Returns the number of comment entries in the panel. */
  async getCommentEntryCount(): Promise<number> {
    const els = await this.driver.findElements(By.css('.comment-panel .comment-entry'));
    return els.length;
  }

  /** Returns true if the "No comments yet" empty state is shown. */
  async isEmptyCommentsMessageVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.xpath("//*[contains(text(),'No comments yet')]")
    );
    return els.length > 0;
  }

  /** Returns the alert message text. */
  async getAlertText(): Promise<string> {
    const el = await this.driver.findElement(By.css('.alert-dismissible'));
    return el.getText();
  }

  // --- Comment entry interactions ---

  /** Returns the text content of the first comment in the panel. */
  async getFirstCommentText(): Promise<string> {
    const el = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-content')), TIMEOUT
    );
    return el.getText();
  }

  /** Returns the text content of ALL comments in the panel. */
  async getAllCommentTexts(): Promise<string[]> {
    const els = await this.driver.findElements(By.css('.comment-panel .comment-content'));
    return Promise.all(els.map(el => el.getText()));
  }

  /** Returns the display name of the first comment author. */
  async getFirstCommentAuthor(): Promise<string> {
    const el = await this.driver.findElement(
      By.css('.comment-panel .comment-entry strong.small')
    );
    return el.getText();
  }

  /** Click the "Reply" button on the first comment. */
  async clickReplyOnFirstComment(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-entry button[aria-label="Reply to comment"]')),
      TIMEOUT
    );
    await btn.click();
  }

  /** Returns true if the inline reply input is visible. */
  async isReplyInputVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.css('.comment-panel .comment-entry .comment-input textarea')
    );
    return els.length > 0;
  }

  /** Type text into the inline reply input and submit. */
  async typeAndSubmitReply(text: string): Promise<void> {
    const textarea = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-entry .comment-input textarea')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(textarea), TIMEOUT);
    await textarea.clear();
    await textarea.sendKeys(text);
    const sendBtn = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-entry .comment-input button.btn-primary')), TIMEOUT
    );
    await this.driver.wait(until.elementIsVisible(sendBtn), TIMEOUT);
    await sendBtn.click();
  }

  /** Click the "Edit" button on the first comment (only visible to comment owner). */
  async clickEditOnFirstComment(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-entry button[aria-label="Edit comment"]')),
      TIMEOUT
    );
    await btn.click();
  }

  /** Returns true if the comment edit textarea is visible. */
  async isCommentEditTextareaVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.css('.comment-panel .comment-entry textarea[aria-label="Edit comment text"]')
    );
    return els.length > 0;
  }

  /** Edit the comment text and click Save. */
  async editCommentAndSave(newText: string): Promise<void> {
    const textarea = await this.driver.findElement(
      By.css('.comment-panel .comment-entry textarea[aria-label="Edit comment text"]')
    );
    await textarea.clear();
    await textarea.sendKeys(newText);
    const saveBtn = await this.driver.findElement(
      By.css('.comment-panel .comment-entry button[aria-label="Save edit"]')
    );
    await saveBtn.click();
  }

  /** Cancel the comment edit. */
  async cancelCommentEdit(): Promise<void> {
    const btn = await this.driver.findElement(
      By.css('.comment-panel .comment-entry button[aria-label="Cancel edit"]')
    );
    await btn.click();
  }

  /** Click the "Delete" button on the first comment (owner or admin). */
  async clickDeleteOnFirstComment(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementLocated(By.css('.comment-panel .comment-entry button[aria-label="Delete comment"]')),
      TIMEOUT
    );
    await btn.click();
  }

  /** Returns true if the delete confirmation dialog is visible. */
  async isDeleteConfirmVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.css('.comment-panel .delete-confirm')
    );
    return els.length > 0;
  }

  /** Click "Delete all" in the delete confirmation dialog. */
  async confirmDeleteComment(): Promise<void> {
    const btn = await this.driver.findElement(
      By.css('.comment-panel .delete-confirm button.btn-danger')
    );
    await btn.click();
  }

  /** Click "Cancel" in the delete confirmation dialog. */
  async cancelDeleteComment(): Promise<void> {
    const btn = await this.driver.findElement(
      By.css('.comment-panel .delete-confirm button.btn-secondary')
    );
    await btn.click();
  }

  /** Returns true if the "Edited" badge is visible on any comment. */
  async isEditedBadgeVisible(): Promise<boolean> {
    const els = await this.driver.findElements(
      By.xpath("//*[contains(@class,'comment-panel')]//*[contains(@class,'badge') and contains(text(),'Edited')]")
    );
    return els.length > 0;
  }

  /** Returns the number of replies containers visible in the panel. */
  async getRepliesContainerCount(): Promise<number> {
    const els = await this.driver.findElements(
      By.css('.comment-panel .replies-container')
    );
    return els.length;
  }

  /** Returns the comment count badge number for a given row (0-based). Null if no badge. */
  async getCommentCountBadge(rowIndex: number): Promise<number | null> {
    const rows = await this.driver.findElements(By.css('table.table-striped tbody tr'));
    if (rowIndex >= rows.length) return null;
    const badges = await rows[rowIndex].findElements(
      By.css('.badge.rounded-pill.bg-primary')
    );
    if (badges.length === 0) return null;
    const text = await badges[0].getText();
    return parseInt(text, 10);
  }
}
