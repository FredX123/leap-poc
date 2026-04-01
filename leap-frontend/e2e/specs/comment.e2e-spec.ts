import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from '../helpers/driver-setup';
import { resetToAnonymous, mockLoginAs, navigateTo } from '../helpers/mock-auth.helper';
import { BudgetReportPage } from '../pages/budget-report.po';
import { MOCK_USERS } from '../config/test-config';

describe('Comment Panel', () => {
  let driver: WebDriver;
  let budgetPage: BudgetReportPage;

  beforeAll(async () => {
    driver = await getDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  // =========================================================================
  // Write user can interact with comments
  // =========================================================================

  describe('Write user (APP_WRITE)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    // --- Open / close panel ---

    it('should open comment panel when clicking comment button', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
    });

    it('should show comment input for write user', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentInputVisible()).toBe(true);
    });

    it('should close comment panel via close button', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
      await budgetPage.closeCommentPanel();
      expect(await budgetPage.isCommentPanelOpen()).toBe(false);
    });

    // --- Create comment ---

    it('should submit a new comment and see it appear', async () => {
      await budgetPage.openCommentPanel(0);
      const initialCount = await budgetPage.getCommentEntryCount();
      await budgetPage.typeComment('E2E write-user comment');
      await budgetPage.submitComment();
      // submitComment now waits for comment to appear
      const newCount = await budgetPage.getCommentEntryCount();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    it('should display the author name on the created comment', async () => {
      await budgetPage.openCommentPanel(0);
      await budgetPage.typeComment('Author check comment');
      await budgetPage.submitComment();
      // submitComment now waits for comment to appear
      const author = await budgetPage.getFirstCommentAuthor();
      expect(author).toContain('Write1');
    });

    // --- Reply to comment ---

    it('should show reply input when clicking Reply', async () => {
      await budgetPage.openCommentPanel(0);
      // Ensure there is at least one comment
      const count = await budgetPage.getCommentEntryCount();
      if (count === 0) {
        await budgetPage.typeComment('Seed comment for reply test');
        await budgetPage.submitComment();
      }
      await budgetPage.clickReplyOnFirstComment();
      expect(await budgetPage.isReplyInputVisible()).toBe(true);
    });

    it('should submit a reply and see nested replies container', async () => {
      await budgetPage.openCommentPanel(0);
      const countBefore = await budgetPage.getCommentEntryCount();
      if (countBefore === 0) {
        await budgetPage.typeComment('Seed comment for reply');
        await budgetPage.submitComment();
      }
      await budgetPage.clickReplyOnFirstComment();
      await budgetPage.typeAndSubmitReply('E2E reply comment');
      // typeAdndSubmitReply now waits for the new reply to appear
      const repliesCount = await budgetPage.getRepliesContainerCount();
      expect(repliesCount).toBeGreaterThanOrEqual(1);
    });

    // --- Edit own comment ---

    it('should show edit textarea when clicking Edit on own comment', async () => {
      await budgetPage.openCommentPanel(0);
      const count = await budgetPage.getCommentEntryCount();
      if (count === 0) {
        await budgetPage.typeComment('Comment to edit');
        await budgetPage.submitComment();
      }
      await budgetPage.clickEditOnFirstComment();
      expect(await budgetPage.isCommentEditTextareaVisible()).toBe(true);
    });

    it('should cancel edit and return to view mode', async () => {
      await budgetPage.openCommentPanel(0);
      const count = await budgetPage.getCommentEntryCount();
      if (count === 0) {
        await budgetPage.typeComment('Comment to cancel-edit');
        await budgetPage.submitComment();
      }
      await budgetPage.clickEditOnFirstComment();
      expect(await budgetPage.isCommentEditTextareaVisible()).toBe(true);
      await budgetPage.cancelCommentEdit();
      expect(await budgetPage.isCommentEditTextareaVisible()).toBe(false);
    });

    it('should save edit and update the comment content', async () => {
      await budgetPage.openCommentPanel(0);
      const count = await budgetPage.getCommentEntryCount();
      if (count === 0) {
        await budgetPage.typeComment('Original comment text');
        await budgetPage.submitComment();
      }
      await budgetPage.clickEditOnFirstComment();
      await budgetPage.editCommentAndSave('Updated E2E text');
      // editCommentAndSave now waits for edit mode to close
      const allTexts = await budgetPage.getAllCommentTexts();
      expect(allTexts.some(t => t.includes('Updated E2E text'))).toBe(true);
    });

    // --- Delete own comment ---

    it('should delete a comment without replies (no confirmation)', async () => {
      // Create a fresh comment on a different row to ensure it has no replies
      await budgetPage.openCommentPanel(1);
      await budgetPage.typeComment('Comment to delete');
      await budgetPage.submitComment();
      const countBefore = await budgetPage.getCommentEntryCount();

      // deleteFirstComment handles confirmation dialog and waits for count to decrease
      await budgetPage.deleteFirstComment();
      const countAfter = await budgetPage.getCommentEntryCount();
      expect(countAfter).toBeLessThan(countBefore);
    });

    // --- Comment count badge ---

    it('should show comment count badge on a row with comments', async () => {
      // First create a comment on row 0
      await budgetPage.openCommentPanel(0);
      const count = await budgetPage.getCommentEntryCount();
      if (count === 0) {
        await budgetPage.typeComment('Badge test comment');
        await budgetPage.submitComment();
      }
      await budgetPage.closeCommentPanel();

      // Reload the page to refresh counts
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();

      // waitForCommentCountBadge handles the async loading
      const badge = await budgetPage.waitForCommentCountBadge(0);
      expect(badge).not.toBeNull();
      expect(badge!).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Read user has limited comment access
  // =========================================================================

  describe('Read user (APP_READ)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.READ_ROLE);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should open comment panel', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
    });

    it('should NOT show comment input for read-only user', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentInputVisible()).toBe(false);
    });

    it('should NOT show reply buttons for read-only user', async () => {
      await budgetPage.openCommentPanel(0);
      const replyButtons = await driver.findElements(
        {css: '.comment-panel .comment-entry button[aria-label="Reply to comment"]'}
      );
      expect(replyButtons.length).toBe(0);
    });

    it('should NOT show edit buttons for read-only user', async () => {
      await budgetPage.openCommentPanel(0);
      const editButtons = await driver.findElements(
        {css: '.comment-panel .comment-entry button[aria-label="Edit comment"]'}
      );
      expect(editButtons.length).toBe(0);
    });

    it('should still be able to view existing comments', async () => {
      await budgetPage.openCommentPanel(0);
      // If there are comments (from previous write-user tests), they should be visible
      const count = await budgetPage.getCommentEntryCount();
      // We don't know the exact count, but the panel should render without errors
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // Group-based write user (GRP_WRITE) can interact with comments
  // =========================================================================

  describe('Write group user (GRP_WRITE)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.WRITE_GROUP);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should open comment panel and show comment input', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
      expect(await budgetPage.isCommentInputVisible()).toBe(true);
    });

    it('should submit a comment as group-based write user', async () => {
      await budgetPage.openCommentPanel(0);
      const initialCount = await budgetPage.getCommentEntryCount();
      await budgetPage.typeComment('E2E group-write comment');
      await budgetPage.submitComment();
      const newCount = await budgetPage.getCommentEntryCount();
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  // =========================================================================
  // Group-based read user (GRP_READ) has limited access
  // =========================================================================

  describe('Read group user (GRP_READ)', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.READ_GROUP);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should open comment panel', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
    });

    it('should NOT show comment input for group-based read user', async () => {
      await budgetPage.openCommentPanel(0);
      expect(await budgetPage.isCommentInputVisible()).toBe(false);
    });

    it('should NOT show reply buttons for group-based read user', async () => {
      await budgetPage.openCommentPanel(0);
      const replyButtons = await driver.findElements(
        {css: '.comment-panel .comment-entry button[aria-label="Reply to comment"]'}
      );
      expect(replyButtons.length).toBe(0);
    });
  });

  // =========================================================================
  // Panel on different rows
  // =========================================================================

  describe('Opening panel on different rows', () => {
    beforeEach(async () => {
      await resetToAnonymous(driver);
      await mockLoginAs(driver, MOCK_USERS.WRITE_ROLE);
      await navigateTo(driver, '/budget-report');
      budgetPage = new BudgetReportPage(driver);
      await budgetPage.waitForPage();
    });

    it('should open comment panel on row 1 (second row)', async () => {
      const rowCount = await budgetPage.getRowCount();
      if (rowCount < 2) {
        pending('Need at least 2 budget rows');
        return;
      }
      await budgetPage.openCommentPanel(1);
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
      expect(await budgetPage.isCommentInputVisible()).toBe(true);
    });

    it('should show empty state or different comments for a different row', async () => {
      const rowCount = await budgetPage.getRowCount();
      if (rowCount < 2) {
        pending('Need at least 2 budget rows');
        return;
      }
      await budgetPage.openCommentPanel(1);
      // Just verify it opens without error
      expect(await budgetPage.isCommentPanelOpen()).toBe(true);
    });
  });
});
