import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  DestroyRef, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentThreadDto, CreateCommentRequest, COMMENT_CATEGORIES, CommentCategory } from '../../models/comment.model';
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
  @Input() segmentName: string | null = null;
  @Input() isOpen = false;

  categories: CommentCategory[] = COMMENT_CATEGORIES;
  selectedCategoryCode = 'NONE';
  @Output() closed = new EventEmitter<void>();
  @Output() commentCountChanged = new EventEmitter<number>();

  thread: CommentThreadDto[] = [];
  loading = false;
  error: string | null = null;
  retryable = false;
  canWrite = false;
  isAdmin = false;
  replyErrorMap: Record<number, string> = {};

  // Width resize state
  panelWidth = 400;
  readonly minPanelWidth = 300;
  readonly maxPanelWidth = 800;
  isResizing = false;
  Math = Math;  // expose to template
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
    this.canWrite = this.auth.hasAnyRoleOrGroup('APP_WRITE', 'APP_ADMIN');
    this.isAdmin = this.auth.hasAnyRoleOrGroup('APP_ADMIN');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.reportType && this.lineKey) {
      this.replyErrorMap = {};
      this.loadThread();
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

  // --- Resize logic ---

  onResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    const startX = event.clientX;
    const startWidth = this.panelWidth;

    this.resizeMoveHandler = (e: MouseEvent) => {
      const delta = startX - e.clientX;  // dragging left = wider
      const newWidth = Math.min(this.maxPanelWidth, Math.max(this.minPanelWidth, startWidth + delta));
      this.panelWidth = newWidth;
      this.cd.markForCheck();
    };

    this.resizeUpHandler = () => {
      this.isResizing = false;
      this.cleanupResize();
      this.cd.markForCheck();
    };

    // Run outside Angular zone for performance during drag
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

  // --- Footer height resize logic ---

  onFooterResizeStart(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    const startY = event.clientY;
    const startHeight = this.footerHeight;

    this.footerResizeMoveHandler = (e: MouseEvent) => {
      const delta = startY - e.clientY;  // dragging up = taller
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

  /** 6.7: Optimistic UI — append placeholder then confirm with server */
  onNewComment(content: string): void {
    const request: CreateCommentRequest = {
      reportType: this.reportType,
      lineKey: this.lineKey,
      segmentName: this.segmentName,
      content,
      parentId: null,
      categoryCode: this.selectedCategoryCode
    };

    // Optimistic: append a temporary entry
    const optimistic = this.createOptimisticEntry(content, null);
    this.thread = [...this.thread, optimistic];
    this.commentCountChanged.emit(this.countComments(this.thread));
    this.cd.markForCheck();

    this.commentService.create(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
      error: (err: HttpErrorResponse) => {
        // Revert optimistic entry
        this.thread = this.thread.filter(t => t.id !== optimistic.id);
        this.commentCountChanged.emit(this.countComments(this.thread));
        this.error = this.resolveError(err, 'post comment');
        this.retryable = false;
        this.cd.markForCheck();
      }
    });
  }

  onReply(event: { parentId: number; content: string }): void {
    // Clear any previous inline error for this parent
    const { [event.parentId]: _, ...rest } = this.replyErrorMap;
    this.replyErrorMap = rest;

    const request: CreateCommentRequest = {
      reportType: this.reportType,
      lineKey: this.lineKey,
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
      },
      error: (err: HttpErrorResponse) => {
        // Show error inline next to the reply input instead of at the top
        const msg = this.resolveError(err, 'post reply');
        this.replyErrorMap = { ...this.replyErrorMap, [event.parentId]: msg };
        this.cd.markForCheck();
      }
    });
  }

  onEdit(event: { id: number; content: string }): void {
    this.commentService.update(event.id, event.content).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
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
      next: () => this.loadThread(),
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

  /** 6.1: Categorised error messages */
  private resolveError(err: HttpErrorResponse, action: string): string {
    if (err.status === 0) return `Network error — please check your connection and try again.`;
    if (err.status === 401) return `Your session has expired. Please log in again.`;
    if (err.status === 403) return `You do not have permission to ${action}.`;
    if (err.status === 404) return `The comment was not found. It may have been deleted.`;
    if (err.status >= 500) return `Server error — please try again later.`;
    // Extract message from structured error response
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

  /** 6.7: Create a temporary optimistic entry */
  private createOptimisticEntry(content: string, parentId: number | null): CommentThreadDto {
    return {
      id: -Date.now(),  // negative temp ID
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
