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
  templateUrl: './comment-entry.component.html',
  styleUrl: './comment-entry.component.scss'
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
