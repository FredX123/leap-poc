import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentThreadDto } from '../../models/comment.model';
import { CommentInputComponent } from '../comment-input/comment-input.component';

@Component({
  selector: 'app-comment-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- System event (ADJUSTMENT / STATUS_CHANGE) -->
      <div *ngIf="isSystemEvent; else userComment"
           class="system-event d-flex align-items-start gap-2 mb-2 p-2 rounded"
           role="article" [attr.aria-label]="'System event from ' + (comment.createdAt | date:'short')">
        <i class="bi bi-gear-fill text-warning mt-1" aria-hidden="true"></i>
        <div class="flex-grow-1">
          <small class="text-muted">System &middot; {{ comment.createdAt | date:'short' }}</small>
          <div class="small" *ngIf="comment.metadata">
            {{ parseMetadata() }}
          </div>
        </div>
      </div>

      <ng-template #userComment>
        <div class="comment-entry mb-2" role="article"
             [attr.aria-label]="'Comment by ' + (comment.displayName || 'Unknown')">
          <div class="d-flex align-items-start gap-2">
            <!-- Avatar initials -->
            <div class="avatar flex-shrink-0" aria-hidden="true">
              {{ initials }}
            </div>

            <div class="flex-grow-1 min-width-0">
              <!-- Header: name + timestamp + badges -->
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <strong class="small">{{ comment.displayName || 'Unknown' }}</strong>
                <small class="text-muted">{{ comment.createdAt | date:'short' }}</small>
                <span *ngIf="comment.isEdited" class="badge bg-secondary badge-sm">Edited</span>
              </div>

              <!-- Content (view mode) -->
              <div *ngIf="!isEditing" class="comment-content small mt-1">
                {{ comment.content }}
              </div>

              <!-- Content (edit mode) -->
              <div *ngIf="isEditing" class="mt-1">
                <label class="visually-hidden" [attr.for]="'edit-' + comment.id">Edit comment</label>
                <textarea [id]="'edit-' + comment.id"
                          class="form-control form-control-sm" rows="2"
                          [(ngModel)]="editText" maxlength="4000"
                          aria-label="Edit comment text"></textarea>
                <div class="mt-1 d-flex gap-1">
                  <button class="btn btn-sm btn-success" [disabled]="!editText.trim()"
                          (click)="saveEdit()" aria-label="Save edit">Save</button>
                  <button class="btn btn-sm btn-secondary"
                          (click)="cancelEdit()" aria-label="Cancel edit">Cancel</button>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="mt-1 d-flex gap-2" *ngIf="!isEditing" role="toolbar"
                   aria-label="Comment actions">
                <button *ngIf="canWrite"
                        class="btn btn-link btn-sm p-0 text-muted"
                        (click)="toggleReply()"
                        [attr.aria-expanded]="showReply"
                        aria-label="Reply to comment">
                  <i class="bi bi-reply" aria-hidden="true"></i> Reply
                </button>
                <button *ngIf="comment.isOwner && canWrite"
                        class="btn btn-link btn-sm p-0 text-muted"
                        (click)="startEdit()"
                        aria-label="Edit comment">
                  <i class="bi bi-pencil" aria-hidden="true"></i> Edit
                </button>
                <button *ngIf="comment.isOwner || isAdmin"
                        class="btn btn-link btn-sm p-0 text-danger"
                        (click)="requestDelete()"
                        aria-label="Delete comment">
                  <i class="bi bi-trash" aria-hidden="true"></i> Delete
                </button>
              </div>

              <!-- Delete confirmation dialog (inline) -->
              <div *ngIf="confirmingDelete" class="delete-confirm mt-2 p-2 border border-danger rounded small"
                   role="alertdialog" aria-label="Confirm deletion">
                <p class="mb-2 text-danger fw-bold">
                  <i class="bi bi-exclamation-triangle-fill me-1" aria-hidden="true"></i>
                  This comment has {{ countAllReplies(comment.replies) }}
                  {{ countAllReplies(comment.replies) === 1 ? 'reply' : 'replies' }}
                  that will also be deleted.
                </p>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-danger" (click)="confirmDelete()">Delete all</button>
                  <button class="btn btn-sm btn-secondary" (click)="confirmingDelete = false">Cancel</button>
                </div>
              </div>

              <!-- Inline reply input + inline error -->
              <div *ngIf="showReply" class="mt-2">
                <div *ngIf="inlineError" class="alert alert-danger small py-1 px-2 mb-2 d-flex align-items-center gap-1"
                     role="alert">
                  <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
                  {{ inlineError }}
                  <button class="btn-close btn-close-sm ms-auto" aria-label="Dismiss"
                          (click)="clearInlineError()"></button>
                </div>
                <app-comment-input (submitted)="onReply($event)"></app-comment-input>
              </div>
            </div>
          </div>

          <!-- Replies -->
          <ng-container *ngTemplateOutlet="repliesBlock"></ng-container>
        </div>
      </ng-template>

    <!-- Shared replies template (collapse deep threads) -->
    <ng-template #repliesBlock>
      <div *ngIf="comment.replies?.length" class="replies-container">
        <!-- Auto-collapse beyond depth 3 -->
        <ng-container *ngIf="depth < 3; else collapsedReplies">
          <app-comment-entry
            *ngFor="let reply of comment.replies; trackBy: trackById"
            [comment]="reply"
            [depth]="depth + 1"
            [canWrite]="canWrite"
            [isAdmin]="isAdmin"
            [replyErrorMap]="replyErrorMap"
            (replied)="replied.emit($event)"
            (edited)="edited.emit($event)"
            (deleted)="deleted.emit($event)"
          ></app-comment-entry>
        </ng-container>
        <ng-template #collapsedReplies>
          <button *ngIf="!expanded" class="btn btn-link btn-sm p-0 text-primary"
                  (click)="expanded = true"
                  [attr.aria-label]="'Show ' + comment.replies.length + ' more replies'">
            <i class="bi bi-chevron-down" aria-hidden="true"></i>
            Show {{ comment.replies.length }} more
            {{ comment.replies.length === 1 ? 'reply' : 'replies' }}
          </button>
          <ng-container *ngIf="expanded">
            <app-comment-entry
              *ngFor="let reply of comment.replies; trackBy: trackById"
              [comment]="reply"
              [depth]="depth + 1"
              [canWrite]="canWrite"
              [isAdmin]="isAdmin"
              [replyErrorMap]="replyErrorMap"
              (replied)="replied.emit($event)"
              (edited)="edited.emit($event)"
              (deleted)="deleted.emit($event)"
            ></app-comment-entry>
          </ng-container>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .comment-entry {
      border-left: 2px solid #dee2e6;
      padding-left: 12px;
    }
    :host:first-child .comment-entry {
      border-left: none;
      padding-left: 0;
    }
    .replies-container {
      margin-left: 20px;
      margin-top: 8px;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #6c757d;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .system-event {
      background-color: #fff3cd;
      border-left: 3px solid #ffc107;
    }
    .delete-confirm {
      background-color: #fff5f5;
    }
    .badge-sm { font-size: 0.65rem; }
    .min-width-0 { min-width: 0; }
    .comment-content { word-break: break-word; }
    .btn-close-sm { font-size: 0.5rem; }
    .alert { border-radius: 4px; }
  `]
})
export class CommentEntryComponent implements OnChanges {
  @Input() comment!: CommentThreadDto;
  @Input() depth = 0;
  @Input() canWrite = false;
  @Input() isAdmin = false;
  @Input() replyErrorMap: Record<number, string> = {};

  @Output() replied = new EventEmitter<{ parentId: number; content: string }>();
  @Output() edited = new EventEmitter<{ id: number; content: string }>();
  @Output() deleted = new EventEmitter<number>();

  showReply = false;
  isEditing = false;
  editText = '';
  expanded = false;
  confirmingDelete = false;
  inlineError: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['replyErrorMap'] && this.replyErrorMap) {
      const err = this.replyErrorMap[this.comment.id];
      if (err) {
        this.inlineError = err;
        this.showReply = true;  // keep reply open so user sees the error
      }
    }
  }

  get isSystemEvent(): boolean {
    return this.comment.eventType === 'ADJUSTMENT' || this.comment.eventType === 'STATUS_CHANGE';
  }

  get initials(): string {
    const name = this.comment.displayName || '?';
    return name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  trackById(_: number, item: CommentThreadDto): number {
    return item.id;
  }

  countAllReplies(replies: CommentThreadDto[]): number {
    let count = 0;
    for (const r of replies) {
      count++;
      if (r.replies?.length) count += this.countAllReplies(r.replies);
    }
    return count;
  }

  parseMetadata(): string {
    if (!this.comment.metadata) return '';
    try {
      const meta = JSON.parse(this.comment.metadata);
      return `${meta.field}: ${meta.old_value} → ${meta.new_value}` +
        (meta.reason ? ` (${meta.reason})` : '');
    } catch {
      return this.comment.metadata;
    }
  }

  toggleReply(): void {
    this.showReply = !this.showReply;
    if (!this.showReply) this.inlineError = null;
  }

  clearInlineError(): void {
    this.inlineError = null;
  }

  onReply(content: string): void {
    this.inlineError = null;
    this.replied.emit({ parentId: this.comment.id, content });
  }

  startEdit(): void {
    this.editText = this.comment.content;
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    const trimmed = this.editText.trim();
    if (trimmed) {
      this.edited.emit({ id: this.comment.id, content: trimmed });
      this.isEditing = false;
    }
  }

  /** Show confirmation dialog if comment has replies, otherwise delete immediately */
  requestDelete(): void {
    if (this.comment.hasReplies || this.comment.replies?.length) {
      this.confirmingDelete = true;
    } else {
      this.deleted.emit(this.comment.id);
    }
  }

  confirmDelete(): void {
    this.confirmingDelete = false;
    this.deleted.emit(this.comment.id);
  }
}
