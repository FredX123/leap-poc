import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, Output
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
         class="system-event d-flex align-items-start gap-2 mb-2 p-2 rounded">
      <i class="bi bi-gear-fill text-warning mt-1"></i>
      <div class="flex-grow-1">
        <small class="text-muted">System &middot; {{ comment.createdAt | date:'short' }}</small>
        <div class="small" *ngIf="comment.metadata">
          {{ parseMetadata() }}
        </div>
      </div>
    </div>

    <!-- User comment -->
    <ng-template #userComment>
      <div class="comment-entry mb-2">
        <div class="d-flex align-items-start gap-2">
          <!-- Avatar initials -->
          <div class="avatar flex-shrink-0">
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
              <textarea class="form-control form-control-sm" rows="2"
                        [(ngModel)]="editText" maxlength="4000"></textarea>
              <div class="mt-1 d-flex gap-1">
                <button class="btn btn-sm btn-success" [disabled]="!editText.trim()"
                        (click)="saveEdit()">Save</button>
                <button class="btn btn-sm btn-secondary" (click)="cancelEdit()">Cancel</button>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="mt-1 d-flex gap-2" *ngIf="!isEditing">
              <button *ngIf="canWrite"
                      class="btn btn-link btn-sm p-0 text-muted"
                      (click)="showReply = !showReply">
                <i class="bi bi-reply"></i> Reply
              </button>
              <button *ngIf="comment.isOwner && canWrite"
                      class="btn btn-link btn-sm p-0 text-muted"
                      (click)="startEdit()">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button *ngIf="comment.isOwner || isAdmin"
                      class="btn btn-link btn-sm p-0 text-danger"
                      (click)="onDelete()">
                <i class="bi bi-trash"></i> Delete
              </button>
            </div>

            <!-- Inline reply input -->
            <div *ngIf="showReply" class="mt-2">
              <app-comment-input (submitted)="onReply($event)"></app-comment-input>
            </div>
          </div>
        </div>

        <!-- Replies (recursive) -->
        <div *ngIf="comment.replies?.length" class="replies-container">
          <app-comment-entry
            *ngFor="let reply of comment.replies"
            [comment]="reply"
            [depth]="depth + 1"
            [canWrite]="canWrite"
            [isAdmin]="isAdmin"
            (replied)="replied.emit($event)"
            (edited)="edited.emit($event)"
            (deleted)="deleted.emit($event)"
          ></app-comment-entry>
        </div>
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
    .badge-sm { font-size: 0.65rem; }
    .min-width-0 { min-width: 0; }
    .comment-content { word-break: break-word; }
  `]
})
export class CommentEntryComponent {
  @Input() comment!: CommentThreadDto;
  @Input() depth = 0;
  @Input() canWrite = false;
  @Input() isAdmin = false;

  @Output() replied = new EventEmitter<{ parentId: number; content: string }>();
  @Output() edited = new EventEmitter<{ id: number; content: string }>();
  @Output() deleted = new EventEmitter<number>();

  showReply = false;
  isEditing = false;
  editText = '';

  get isSystemEvent(): boolean {
    return this.comment.eventType === 'ADJUSTMENT' || this.comment.eventType === 'STATUS_CHANGE';
  }

  get initials(): string {
    const name = this.comment.displayName || '?';
    return name.split(' ').map(w => w.charAt(0)).join('').substring(0, 2).toUpperCase();
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

  onReply(content: string): void {
    this.replied.emit({ parentId: this.comment.id, content });
    this.showReply = false;
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

  onDelete(): void {
    this.deleted.emit(this.comment.id);
  }
}
