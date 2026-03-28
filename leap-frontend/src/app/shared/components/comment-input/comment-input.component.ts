import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-input.component.html',
  styleUrl: './comment-input.component.scss'
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
