import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  DestroyRef, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CommentThreadDto, CreateCommentRequest, COMMENT_CATEGORIES, CommentCategory,
  CATEGORY_LABEL_MAP, CommentChildRow, LineCommentSummary, DriverGroupData
} from '../../models/comment.model';
import { FormsModule } from '@angular/forms';
import { CommentEntryComponent } from '../comment-entry/comment-entry.component';
import { CommentInputComponent } from '../comment-input/comment-input.component';

@Component({
  selector: 'app-comment-thread-panel',
  standalone: true,
  imports: [CommonModule, CommentEntryComponent, CommentInputComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-thread-panel.component.html',
  styleUrl: './comment-thread-panel.component.scss'
})
export class CommentThreadPanelComponent implements OnChanges, OnDestroy {
  @Input() reportType = '';
  @Input() lineKey = '';
  @Input() lineName = '';
  @Input() segmentName: string | null = null;
  @Input() isOpen = false;
  @Input() childRows: CommentChildRow[] = [];
  @Input() variance: number | null = null;

  categories: CommentCategory[] = COMMENT_CATEGORIES;
  selectedCategoryCode = 'NONE';
  @Output() closed = new EventEmitter<void>();
  @Output() commentCountChanged = new EventEmitter<number>();

  // Own thread (current row's comments)
  thread: CommentThreadDto[] = [];
  loading = false;
  error: string | null = null;
  retryable = false;
  canWrite = false;
  isAdmin = false;
  replyErrorMap: Record<number, string> = {};

  // Hierarchy data
  activeTab: 'hierarchy' | 'driver' = 'hierarchy';
  hierarchyLoading = false;
  hierarchyData: Record<string, CommentThreadDto[]> = {};
  lineSummaries: LineCommentSummary[] = [];
  driverGroups: DriverGroupData[] = [];
  expandedHierarchyCards: Set<string> = new Set();
  expandedDriverLines: Set<string> = new Set(); // "driverCode|lineKey"

  // Computed header data
  totalRootCount = 0;
  lastUpdateDate: string | null = null;

  // Width resize state
  panelWidth = 480;
  readonly minPanelWidth = 360;
  readonly maxPanelWidth = 900;
  isResizing = false;
  Math = Math;
  private resizeMoveHandler: ((e: MouseEvent) => void) | null = null;
  private resizeUpHandler: (() => void) | null = null;

  // Footer height resize state
  footerHeight = 76;
  readonly minFooterHeight = 56;
  readonly maxFooterHeight = 300;
  private footerResizeMoveHandler: ((e: MouseEvent) => void) | null = null;
  private footerResizeUpHandler: (() => void) | null = null;

  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);

  constructor(
    public cd: ChangeDetectorRef,
    private commentService: CommentService,
    private auth: AuthService
  ) {
    this.canWrite = this.auth.hasAnyGroup('GRP_WRITE', 'GRP_ADMIN');
    this.isAdmin = this.auth.hasAnyGroup('GRP_ADMIN');
  }

  get hasChildren(): boolean {
    return this.childRows.length > 0;
  }

  get truncatedLineName(): string {
    if (!this.lineName) return '';
    return this.lineName.length > 30 ? this.lineName.substring(0, 27) + '...' : this.lineName;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const reopened = changes['isOpen'] && this.isOpen;
    const keyChanged = changes['lineKey'] && !changes['lineKey'].firstChange;

    if ((reopened || keyChanged) && this.isOpen && this.reportType && this.lineKey) {
      this.replyErrorMap = {};
      this.expandedHierarchyCards = new Set();
      this.expandedDriverLines = new Set();
      this.activeTab = 'hierarchy';
      this.hierarchyData = {};
      this.lineSummaries = [];
      this.driverGroups = [];
      this.totalRootCount = 0;
      this.lastUpdateDate = null;
      this.loadThread();
      if (this.hasChildren) {
        this.loadHierarchyData();
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupResize();
    this.cleanupFooterResize();
  }

  close(): void {
    this.closed.emit();
  }

  trackById(_: number, item: CommentThreadDto): number {
    return item.id;
  }

  switchTab(tab: 'hierarchy' | 'driver'): void {
    this.activeTab = tab;
    this.cd.markForCheck();
  }

  toggleHierarchyCard(lineKey: string): void {
    if (this.expandedHierarchyCards.has(lineKey)) {
      this.expandedHierarchyCards.delete(lineKey);
    } else {
      this.expandedHierarchyCards.add(lineKey);
    }
    this.cd.markForCheck();
  }

  toggleDriverLine(driverCode: string, lineKey: string): void {
    const key = `${driverCode}|${lineKey}`;
    if (this.expandedDriverLines.has(key)) {
      this.expandedDriverLines.delete(key);
    } else {
      this.expandedDriverLines.add(key);
    }
    this.cd.markForCheck();
  }

  isHierarchyCardExpanded(lineKey: string): boolean {
    return this.expandedHierarchyCards.has(lineKey);
  }

  isDriverLineExpanded(driverCode: string, lineKey: string): boolean {
    return this.expandedDriverLines.has(`${driverCode}|${lineKey}`);
  }

  getBreadcrumb(childRow: CommentChildRow): string {
    if (!childRow.parentCode) return this.truncate(childRow.name, 30);
    const parent = this.childRows.find(r => r.code === childRow.parentCode);
    const parentName = parent ? this.truncate(parent.name, 10) : '';
    return `${parentName} > ${this.truncate(childRow.name, 15)}`;
  }

  getLineBreadcrumb(lineKey: string): string {
    const child = this.childRows.find(r => r.code === lineKey);
    if (!child) return lineKey;
    return this.getBreadcrumb(child);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  formatVariance(pct: number | null | undefined): string {
    if (pct == null || isNaN(pct)) return '';
    return Math.abs(pct).toFixed(1) + '%';
  }

  varianceArrow(pct: number | null | undefined): string {
    if (pct == null || isNaN(pct) || pct === 0) return '';
    return pct < 0 ? 'bi-arrow-down' : 'bi-arrow-up';
  }

  varianceClass(pct: number | null | undefined): string {
    if (pct == null || isNaN(pct) || pct === 0) return '';
    return pct < 0 ? 'text-danger' : 'text-success';
  }

  getDriverLabel(code: string): string {
    return CATEGORY_LABEL_MAP[code] || code;
  }

  truncate(text: string, max: number): string {
    return text.length > max ? text.substring(0, max - 3) + '...' : text;
  }

  // --- Resize logic ---

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    const startX = event.clientX;
    const startWidth = this.panelWidth;

    this.resizeMoveHandler = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      const newWidth = Math.min(this.maxPanelWidth, Math.max(this.minPanelWidth, startWidth + delta));
      this.panelWidth = newWidth;
      this.cd.markForCheck();
    };

    this.resizeUpHandler = () => {
      this.isResizing = false;
      this.cleanupResize();
      this.cd.markForCheck();
    };

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.resizeMoveHandler!);
      document.addEventListener('mouseup', this.resizeUpHandler!);
    });
  }

  private cleanupResize(): void {
    if (this.resizeMoveHandler) {
      document.removeEventListener('mousemove', this.resizeMoveHandler);
      this.resizeMoveHandler = null;
    }
    if (this.resizeUpHandler) {
      document.removeEventListener('mouseup', this.resizeUpHandler);
      this.resizeUpHandler = null;
    }
  }

  onFooterResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    const startY = event.clientY;
    const startHeight = this.footerHeight;

    this.footerResizeMoveHandler = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const newHeight = Math.min(this.maxFooterHeight, Math.max(this.minFooterHeight, startHeight + delta));
      this.footerHeight = newHeight;
      this.cd.markForCheck();
    };

    this.footerResizeUpHandler = () => {
      this.isResizing = false;
      this.cleanupFooterResize();
      this.cd.markForCheck();
    };

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.footerResizeMoveHandler!);
      document.addEventListener('mouseup', this.footerResizeUpHandler!);
    });
  }

  private cleanupFooterResize(): void {
    if (this.footerResizeMoveHandler) {
      document.removeEventListener('mousemove', this.footerResizeMoveHandler);
      this.footerResizeMoveHandler = null;
    }
    if (this.footerResizeUpHandler) {
      document.removeEventListener('mouseup', this.footerResizeUpHandler);
      this.footerResizeUpHandler = null;
    }
  }

  // --- Comment CRUD ---

  onNewComment(content: string): void {
    const request: CreateCommentRequest = {
      reportType: this.reportType,
      lineKey: this.lineKey,
      segmentName: this.segmentName,
      content,
      parentId: null,
      categoryCode: this.selectedCategoryCode
    };

    const optimistic = this.createOptimisticEntry(content, null);
    this.thread = [...this.thread, optimistic];
    this.commentCountChanged.emit(this.countComments(this.thread));
    this.cd.markForCheck();

    this.commentService.create(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.selectedCategoryCode = 'NONE';
        this.loadThread();
      },
      error: (err: HttpErrorResponse) => {
        this.thread = this.thread.filter(t => t.id !== optimistic.id);
        this.commentCountChanged.emit(this.countComments(this.thread));
        this.error = this.resolveError(err, 'post comment');
        this.retryable = false;
        this.cd.markForCheck();
      }
    });
  }

  onReply(event: { parentId: number; content: string }): void {
    const { [event.parentId]: _, ...rest } = this.replyErrorMap;
    this.replyErrorMap = rest;

    const replyLineKey = this.findLineKeyForComment(event.parentId) || this.lineKey;

    const request: CreateCommentRequest = {
      reportType: this.reportType,
      lineKey: replyLineKey,
      segmentName: this.segmentName,
      content: event.content,
      parentId: event.parentId,
      categoryCode: 'NONE'
    };
    this.commentService.create(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.replyErrorMap = {};
        this.loadThread();
        if (this.hasChildren) this.loadHierarchyData();
      },
      error: (err: HttpErrorResponse) => {
        const msg = this.resolveError(err, 'post reply');
        this.replyErrorMap = { ...this.replyErrorMap, [event.parentId]: msg };
        this.cd.markForCheck();
      }
    });
  }

  onEdit(event: { id: number; content: string; categoryCode?: string }): void {
    this.commentService.update(event.id, event.content, event.categoryCode).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loadThread();
        if (this.hasChildren) this.loadHierarchyData();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.resolveError(err, 'update comment');
        this.retryable = false;
        this.cd.markForCheck();
      }
    });
  }

  onDelete(id: number): void {
    this.commentService.delete(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.loadThread();
        if (this.hasChildren) this.loadHierarchyData();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.resolveError(err, 'delete comment');
        this.retryable = false;
        this.cd.markForCheck();
      }
    });
  }

  loadThread(): void {
    this.loading = true;
    this.error = null;
    this.retryable = false;
    this.commentService.getThread(this.reportType, this.lineKey, this.segmentName).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: thread => {
        this.thread = thread;
        this.loading = false;
        this.commentCountChanged.emit(this.countComments(thread));
        this.computeHeaderStats();
        this.cd.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.resolveError(err, 'load comments');
        this.retryable = !err.status || err.status >= 500 || err.status === 0;
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  private loadHierarchyData(): void {
    if (!this.segmentName || this.childRows.length === 0) return;
    this.hierarchyLoading = true;

    this.commentService.getHierarchyThreads(this.reportType, this.segmentName, this.lineKey).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: data => {
        this.hierarchyData = data;
        this.hierarchyLoading = false;
        this.computeLineSummaries();
        this.computeDriverGroups();
        this.computeHeaderStats();
        this.cd.markForCheck();
      },
      error: () => {
        this.hierarchyLoading = false;
        this.cd.markForCheck();
      }
    });
  }

  private computeLineSummaries(): void {
    const childMap = new Map(this.childRows.map(c => [c.code, c]));
    const processedKeys = new Set<string>();

    const summaries: LineCommentSummary[] = [];

    // Process known child rows first
    for (const child of this.childRows) {
      const threads = this.hierarchyData[child.code] || [];
      if (threads.length === 0) continue;
      processedKeys.add(child.code);

      const roots = threads.filter(t => t.parentId == null);
      const allComments = this.flattenThreads(threads);
      const latestComment = allComments.length > 0
        ? allComments.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b)
        : null;
      const drivers = [...new Set(roots.map(r => r.categoryCode))];

      summaries.push({
        lineKey: child.code,
        rootCount: roots.length,
        lastUpdate: latestComment?.updatedAt ?? null,
        latestAuthor: latestComment?.displayName ?? null,
        drivers,
        threads,
        variance: child.variance
      });
    }

    // Process any hierarchy keys not in childRows (deep descendants)
    for (const [key, threads] of Object.entries(this.hierarchyData)) {
      if (processedKeys.has(key) || threads.length === 0) continue;

      const roots = threads.filter(t => t.parentId == null);
      const allComments = this.flattenThreads(threads);
      const latestComment = allComments.length > 0
        ? allComments.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b)
        : null;
      const drivers = [...new Set(roots.map(r => r.categoryCode))];

      summaries.push({
        lineKey: key,
        rootCount: roots.length,
        lastUpdate: latestComment?.updatedAt ?? null,
        latestAuthor: latestComment?.displayName ?? null,
        drivers,
        threads,
        variance: childMap.get(key)?.variance ?? null
      });
    }

    this.lineSummaries = summaries.filter(s => s.rootCount > 0);
  }

  private computeDriverGroups(): void {
    const driverMap = new Map<string, { lineKey: string; name: string; breadcrumb: string; rootCount: number; threads: CommentThreadDto[] }[]>();
    const childMap = new Map(this.childRows.map(c => [c.code, c]));

    for (const [key, threads] of Object.entries(this.hierarchyData)) {
      const roots = threads.filter(t => t.parentId == null);
      if (roots.length === 0) continue;

      const child = childMap.get(key);
      const name = child?.name || key;
      const breadcrumb = child ? this.getBreadcrumb(child) : key;

      for (const root of roots) {
        const driver = root.categoryCode || 'NONE';
        if (!driverMap.has(driver)) driverMap.set(driver, []);

        const existing = driverMap.get(driver)!.find(l => l.lineKey === key);
        if (existing) {
          existing.rootCount++;
        } else {
          driverMap.get(driver)!.push({
            lineKey: key,
            name,
            breadcrumb,
            rootCount: 1,
            threads: threads.filter(t => t.parentId == null && t.categoryCode === driver)
          });
        }
      }
    }

    this.driverGroups = Array.from(driverMap.entries())
      .map(([code, lines]) => ({
        driverCode: code,
        driverLabel: this.getDriverLabel(code),
        rowCount: lines.length,
        lines
      }))
      .sort((a, b) => b.rowCount - a.rowCount);
  }

  private computeHeaderStats(): void {
    // Own root comments
    const ownRoots = this.thread.filter(t => t.parentId == null).length;

    // Children root comments
    let childRoots = 0;
    let latestUpdate: string | null = null;

    for (const summary of this.lineSummaries) {
      childRoots += summary.rootCount;
      if (summary.lastUpdate && (!latestUpdate || summary.lastUpdate > latestUpdate)) {
        latestUpdate = summary.lastUpdate;
      }
    }

    // Also check own thread for latest
    const ownFlat = this.flattenThreads(this.thread);
    if (ownFlat.length > 0) {
      const ownLatest = ownFlat.reduce((a, b) => a.updatedAt > b.updatedAt ? a : b).updatedAt;
      if (!latestUpdate || ownLatest > latestUpdate) latestUpdate = ownLatest;
    }

    this.totalRootCount = ownRoots + childRoots;
    this.lastUpdateDate = latestUpdate ? latestUpdate.substring(0, 10) : null;
  }

  private flattenThreads(threads: CommentThreadDto[]): CommentThreadDto[] {
    const result: CommentThreadDto[] = [];
    for (const t of threads) {
      result.push(t);
      if (t.replies?.length) {
        result.push(...this.flattenThreads(t.replies));
      }
    }
    return result;
  }

  private resolveError(err: HttpErrorResponse, action: string): string {
    if (err.status === 0) return `Network error — please check your connection and try again.`;
    if (err.status === 401) return `Your session has expired. Please log in again.`;
    if (err.status === 403) return `You do not have permission to ${action}.`;
    if (err.status === 404) return `The comment was not found. It may have been deleted.`;
    if (err.status >= 500) return `Server error — please try again later.`;
    const body = err.error;
    if (body?.message) return body.message;
    return `Failed to ${action}.`;
  }

  private countComments(entries: CommentThreadDto[]): number {
    let count = 0;
    for (const e of entries) {
      count++;
      if (e.replies?.length) {
        count += this.countComments(e.replies);
      }
    }
    return count;
  }

  private findLineKeyForComment(commentId: number): string | null {
    // Search in own thread
    const ownFound = this.findInThreads(this.thread, commentId);
    if (ownFound) return ownFound.lineKey;
    // Search in hierarchy data
    for (const [lineKey, threads] of Object.entries(this.hierarchyData)) {
      const found = this.findInThreads(threads, commentId);
      if (found) return lineKey;
    }
    return null;
  }

  private findInThreads(threads: CommentThreadDto[], commentId: number): CommentThreadDto | null {
    for (const t of threads) {
      if (t.id === commentId) return t;
      if (t.replies?.length) {
        const found = this.findInThreads(t.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  }

  private createOptimisticEntry(content: string, parentId: number | null): CommentThreadDto {
    return {
      id: -Date.now(),
      userId: '',
      displayName: this.auth.user?.displayName || 'You',
      email: '',
      content,
      parentId,
      reportType: this.reportType,
      lineKey: this.lineKey,
      segmentName: this.segmentName,
      categoryCode: this.selectedCategoryCode,
      eventType: 'COMMENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isOwner: true,
      hasReplies: false,
      replies: []
    };
  }
}
