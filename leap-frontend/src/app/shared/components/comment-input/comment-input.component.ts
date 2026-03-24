import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="comment-input d-flex gap-2 align-items-start">
      <textarea
        class="form-control form-control-sm"
        rows="2"
        placeholder="Write a comment..."
        [(ngModel)]="text"
        (keydown.enter)="onSubmit($event)"
        maxlength="4000"
      ></textarea>
      <button
        class="btn btn-sm btn-primary flex-shrink-0"
        [disabled]="!text.trim()"
        (click)="onSubmit($event)">
        <i class="bi bi-send"></i>
      </button>
    </div>
  `,
  styles: [`
    textarea { resize: none; }
  `]
})
export class CommentInputComponent {
  @Output() submitted = new EventEmitter<string>();

  text = '';

  onSubmit(event: Event): void {
    event.preventDefault();
    const trimmed = this.text.trim();
    if (trimmed) {
      this.submitted.emit(trimmed);
      this.text = '';
    }
  }
}
