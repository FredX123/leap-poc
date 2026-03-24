import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  DestroyRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
    <div class="panel-backdrop" *ngIf="isOpen" (click)="close()"></div>

    <!-- Slide-out panel -->
    <div class="comment-panel" [class.open]="isOpen">
      <!-- Panel header -->
      <div class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h6 class="mb-0">
          <i class="bi bi-chat-dots me-2"></i>Comments
        </h6>
        <button class="btn btn-sm btn-outline-secondary" (click)="close()">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Panel body -->
      <div class="panel-body p-3">
        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Error -->
        <div *ngIf="error" class="alert alert-danger small">{{ error }}</div>

        <!-- Empty state -->
        <div *ngIf="!loading && !error && thread.length === 0" class="text-center text-muted py-4">
          <i class="bi bi-chat-square-text" style="font-size: 2rem;"></i>
          <p class="mt-2 small">No comments yet. Start the conversation!</p>
        </div>

        <!-- Thread entries -->
        <div *ngIf="!loading && thread.length > 0" class="thread-list">
          <app-comment-entry
            *ngFor="let entry of thread"
            [comment]="entry"
            [canWrite]="canWrite"
            [isAdmin]="isAdmin"
            (replied)="onReply($event)"
            (edited)="onEdit($event)"
            (deleted)="onDelete($event)"
          ></app-comment-entry>
        </div>
      </div>

      <!-- Panel footer: new comment input -->
      <div class="panel-footer p-3 border-top" *ngIf="canWrite">
        <app-comment-input (submitted)="onNewComment($event)"></app-comment-input>
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
      right: -420px;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 1050;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
    }
    .comment-panel.open {
      right: 0;
    }
    .panel-body {
      flex: 1;
      overflow-y: auto;
    }
    .thread-list { padding-bottom: 8px; }
  `]
})
export class CommentThreadPanelComponent implements OnChanges {
  @Input() entityType = '';
  @Input() entityId = 0;
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() commentCountChanged = new EventEmitter<number>();

  thread: CommentThreadDto[] = [];
  loading = false;
  error: string | null = null;
  canWrite = false;
  isAdmin = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private commentService: CommentService,
    private auth: AuthService
  ) {
    this.canWrite = this.auth.hasAnyRole('APP_WRITE', 'APP_ADMIN');
    this.isAdmin = this.auth.hasRole('APP_ADMIN');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.entityType && this.entityId) {
      this.loadThread();
    }
  }

  close(): void {
    this.closed.emit();
  }

  onNewComment(content: string): void {
    const request: CreateCommentRequest = {
      entityType: this.entityType,
      entityId: this.entityId,
      content,
      parentId: null
    };
    this.commentService.create(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
      error: () => {
        this.error = 'Failed to post comment.';
        this.cd.markForCheck();
      }
    });
  }

  onReply(event: { parentId: number; content: string }): void {
    const request: CreateCommentRequest = {
      entityType: this.entityType,
      entityId: this.entityId,
      content: event.content,
      parentId: event.parentId
    };
    this.commentService.create(request).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
      error: () => {
        this.error = 'Failed to post reply.';
        this.cd.markForCheck();
      }
    });
  }

  onEdit(event: { id: number; content: string }): void {
    this.commentService.update(event.id, event.content).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
      error: () => {
        this.error = 'Failed to update comment.';
        this.cd.markForCheck();
      }
    });
  }

  onDelete(id: number): void {
    this.commentService.delete(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.loadThread(),
      error: () => {
        this.error = 'Failed to delete comment.';
        this.cd.markForCheck();
      }
    });
  }

  private loadThread(): void {
    this.loading = true;
    this.error = null;
    this.commentService.getThread(this.entityType, this.entityId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: thread => {
        this.thread = thread;
        this.loading = false;
        this.commentCountChanged.emit(this.countComments(thread));
        this.cd.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load comments.';
        this.loading = false;
        this.cd.markForCheck();
      }
    });
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
}
