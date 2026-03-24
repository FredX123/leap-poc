import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  DestroyRef, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommentThreadDto, CreateCommentRequest } from '../../models/comment.model';
import { CommentEntryComponent } from '../comment-entry/comment-entry.component';
import { CommentInputComponent } from '../comment-input/comment-input.component';

@Component({
  selector: 'app-comment-thread-panel',
  standalone: true,
  imports: [CommonModule, CommentEntryComponent, CommentInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div class="panel-backdrop" *ngIf="isOpen" (click)="close()"
         aria-hidden="true"></div>

    <!-- Slide-out panel -->
    <div class="comment-panel" [class.open]="isOpen"
         [class.resizing]="isResizing"
         [style.width.px]="panelWidth"
         role="complementary" aria-label="Comment thread panel"
         (keydown.escape)="close()">

      <!-- Resize handle -->
      <div class="resize-handle" (mousedown)="onResizeStart($event)"
           role="separator" aria-orientation="vertical"
           aria-label="Drag to resize comment panel"
           tabindex="0"
           (keydown.arrowLeft)="panelWidth = Math.min(panelWidth + 20, maxPanelWidth); cd.markForCheck()"
           (keydown.arrowRight)="panelWidth = Math.max(panelWidth - 20, minPanelWidth); cd.markForCheck()">
        <div class="resize-handle-indicator"></div>
      </div>

      <!-- Panel header -->
      <div class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h6 class="mb-0" id="comment-panel-title">
          <i class="bi bi-chat-dots me-2" aria-hidden="true"></i>Comments
        </h6>
        <button class="btn btn-sm btn-outline-secondary" (click)="close()"
                aria-label="Close comments panel">
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Panel body -->
      <div class="panel-body p-3" role="log" aria-labelledby="comment-panel-title"
           aria-live="polite">
        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-4" role="status">
          <div class="spinner-border spinner-border-sm text-primary">
            <span class="visually-hidden">Loading comments...</span>
          </div>
        </div>

        <!-- Error (6.1: categorised messages + retry) -->
        <div *ngIf="error" class="alert alert-danger small d-flex align-items-center gap-2"
             role="alert">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <span class="flex-grow-1">{{ error }}</span>
          <button *ngIf="retryable" class="btn btn-sm btn-outline-danger flex-shrink-0"
                  (click)="loadThread()" aria-label="Retry loading comments">
            <i class="bi bi-arrow-clockwise" aria-hidden="true"></i> Retry
          </button>
        </div>

        <!-- Empty state (6.2) -->
        <div *ngIf="!loading && !error && thread.length === 0"
             class="text-center text-muted py-4">
          <i class="bi bi-chat-square-text" style="font-size: 2rem;" aria-hidden="true"></i>
          <p class="mt-2 small">No comments yet. Start the conversation!</p>
        </div>

        <!-- Thread entries -->
        <div *ngIf="!loading && thread.length > 0" class="thread-list"
             role="list" aria-label="Comment thread">
          <app-comment-entry
            *ngFor="let entry of thread; trackBy: trackById"
            [comment]="entry"
            [canWrite]="canWrite"
            [isAdmin]="isAdmin"
            [replyErrorMap]="replyErrorMap"
            (replied)="onReply($event)"
            (edited)="onEdit($event)"
            (deleted)="onDelete($event)"
          ></app-comment-entry>
        </div>
      </div>

      <!-- Panel footer: new comment input -->
      <div class="panel-footer" *ngIf="canWrite">
        <div class="footer-resize-handle" (mousedown)="onFooterResizeStart($event)"
             role="separator" aria-orientation="horizontal"
             aria-label="Drag to resize input area"
             tabindex="0"
             (keydown.arrowUp)="footerHeight = Math.min(footerHeight + 20, maxFooterHeight); cd.markForCheck()"
             (keydown.arrowDown)="footerHeight = Math.max(footerHeight - 20, minFooterHeight); cd.markForCheck()">
          <div class="footer-resize-indicator"></div>
        </div>
        <div class="p-3">
          <app-comment-input [textareaHeight]="footerHeight - 24"
                             (submitted)="onNewComment($event)"></app-comment-input>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1040;
    }
    .comment-panel {
      position: fixed;
      top: 0;
      right: -120%;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 1050;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
    }
    .comment-panel.resizing {
      transition: none;
      user-select: none;
    }
    .comment-panel.open {
      right: 0;
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
    }
    .thread-list { padding-bottom: 8px; }
    .panel-footer {
      flex-shrink: 0;
      border-top: 1px solid #dee2e6;
    }
    .footer-resize-handle {
      height: 6px;
      cursor: row-resize;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .footer-resize-handle:hover .footer-resize-indicator,
    .footer-resize-handle:active .footer-resize-indicator {
      opacity: 1;
    }
    .footer-resize-indicator {
      width: 40px;
      height: 3px;
      border-radius: 2px;
      background-color: #6c757d;
      opacity: 0.3;
      transition: opacity 0.15s;
    }
    .resize-handle {
      position: absolute;
      left: -4px;
      top: 0;
      width: 8px;
      height: 100%;
      cursor: col-resize;
      z-index: 1060;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .resize-handle:hover .resize-handle-indicator,
    .resize-handle:active .resize-handle-indicator {
      opacity: 1;
    }
    .resize-handle-indicator {
      width: 3px;
      height: 40px;
      border-radius: 2px;
      background-color: #6c757d;
      opacity: 0;
      transition: opacity 0.15s;
    }
  `]
})
export class CommentThreadPanelComponent implements OnChanges, OnDestroy {
  @Input() entityType = '';
  @Input() entityId = 0;
  @Input() isOpen = false;
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
    this.canWrite = this.auth.hasAnyRole('APP_WRITE', 'APP_ADMIN');
    this.isAdmin = this.auth.hasRole('APP_ADMIN');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.entityType && this.entityId) {
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
      entityType: this.entityType,
      entityId: this.entityId,
      content,
      parentId: null
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
      entityType: this.entityType,
      entityId: this.entityId,
      content: event.content,
      parentId: event.parentId
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
    this.commentService.getThread(this.entityType, this.entityId).pipe(
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
      entityType: this.entityType,
      entityId: this.entityId,
      eventType: 'COMMENT',
      metadata: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      isOwner: true,
      hasReplies: false,
      replies: []
    };
  }
}
