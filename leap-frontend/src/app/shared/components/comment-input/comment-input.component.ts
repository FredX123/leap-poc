import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="comment-input d-flex gap-2 align-items-start" role="form"
         aria-label="Write a comment">
      <textarea
        class="form-control form-control-sm"
        placeholder="Write a comment..."
        [(ngModel)]="text"
        (keydown.enter)="onSubmit($event)"
        maxlength="4000"
        aria-label="Comment text"
        [style.height.px]="textareaHeight"
      ></textarea>
      <button
        class="btn btn-sm btn-primary flex-shrink-0"
        [disabled]="!text.trim()"
        (click)="onSubmit($event)"
        aria-label="Send comment">
        <i class="bi bi-send" aria-hidden="true"></i>
      </button>
    </div>
  `,
  styles: [`
    textarea { resize: none; min-height: 40px; }
  `]
})
export class CommentInputComponent {
  @Input() textareaHeight = 52;
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
