import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LcrCalcLineDto } from '../../models/lcr-calc-report.model';

export interface AdjustmentSaveEvent {
  lineId: number;
  adjustmentValue: number;
  comment: string;
}

@Component({
  selector: 'app-lcr-adjustment-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lcr-adjustment-panel.component.html',
  styleUrl: './lcr-adjustment-panel.component.scss'
})
export class LcrAdjustmentPanelComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() line: LcrCalcLineDto | null = null;
  @Input() saving = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<AdjustmentSaveEvent>();
  @Output() deleted = new EventEmitter<number>(); // lineId

  adjustmentValue: string = '';
  comment: string = '';
  submitted = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['line'] || changes['isOpen']) {
      if (this.isOpen && this.line) {
        // Pre-fill with existing adjustment if any
        this.adjustmentValue = this.line.adjustmentValue != null
          ? this.line.adjustmentValue.toString()
          : '';
        this.comment = this.line.adjustmentComment ?? '';
        this.submitted = false;
      }
    }
  }

  get originalValue(): number | null {
    return this.line?.marketValue ?? null;
  }

  get newAdjustedValue(): number | null {
    if (this.originalValue == null) return null;
    const adj = parseFloat(this.adjustmentValue);
    if (isNaN(adj)) return this.originalValue;
    return this.originalValue + adj;
  }

  get hasExistingAdjustment(): boolean {
    return this.line?.adjustmentValue != null;
  }

  get isAdjustmentValid(): boolean {
    const adj = parseFloat(this.adjustmentValue);
    return !isNaN(adj) && adj !== 0;
  }

  get isCommentValid(): boolean {
    return this.comment.trim().length > 0;
  }

  formatAmount(value: number | null): string {
    if (value == null) return '';
    return new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(value);
  }

  close(): void {
    this.closed.emit();
  }

  onSave(): void {
    this.submitted = true;
    if (!this.isAdjustmentValid || !this.isCommentValid || !this.line) return;

    this.saved.emit({
      lineId: this.line.id,
      adjustmentValue: parseFloat(this.adjustmentValue),
      comment: this.comment.trim()
    });
  }

  onDelete(): void {
    if (this.line) {
      this.deleted.emit(this.line.id);
    }
  }
}
