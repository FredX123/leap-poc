import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OsfiLcrReportLine } from '../../shared/models/lcr-report.model';

export interface AdjustmentSaveEvent {
  lineId: number;
  adjustmentValue: number;
  comment: string;
}

@Component({
  selector: 'app-osfi-lcr-adjustment-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div class="panel-backdrop" *ngIf="isOpen" (click)="close()"></div>

    <!-- Slide-out panel -->
    <div class="adjustment-panel" [class.open]="isOpen">

      <!-- Panel header -->
      <div class="panel-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h6 class="mb-0 fw-bold">Edit Value: LCR - {{ line?.lineCode }}</h6>
        <button class="btn btn-sm btn-outline-secondary" (click)="close()">✕</button>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingAdjustment" class="text-center my-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2 small text-muted">Loading adjustment...</span>
      </div>

      <!-- Panel body -->
      <div class="panel-body p-3" *ngIf="line && !loadingAdjustment">
        <p class="text-muted small mb-3">{{ line!.lineName }}</p>

        <!-- Original value -->
        <div class="mb-3">
          <label class="form-label small fw-semibold">Original value in 1000s</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control" readonly [value]="formatAmount(currentValue)">
          </div>
        </div>

        <!-- Adjustment value -->
        <div class="mb-1">
          <label class="form-label small fw-semibold">Adjustment value</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control"
                   [(ngModel)]="adjustmentValue"
                   [class.is-invalid]="submitted && !isAdjustmentValid"
                   placeholder="Adjustment value" step="0.01">
          </div>
          <div class="text-danger small mt-1" *ngIf="submitted && !isAdjustmentValid">
            Mandatory Field.
          </div>
        </div>

        <!-- New adjusted value -->
        <div class="mb-3 mt-3">
          <label class="form-label small fw-semibold">New adjusted value in 1000s</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control" readonly [value]="formatAmount(newAdjustedValue)">
          </div>
        </div>

        <!-- Comment -->
        <div class="mb-1">
          <label class="form-label small fw-semibold">Comment</label>
          <textarea class="form-control form-control-sm"
                    [(ngModel)]="comment"
                    [class.is-invalid]="submitted && !isCommentValid"
                    rows="4" placeholder="Comment"></textarea>
          <div class="text-danger small mt-1" *ngIf="submitted && !isCommentValid">
            Mandatory Field.
          </div>
        </div>
      </div>

      <!-- Panel footer -->
      <div class="panel-footer p-3 border-top d-flex gap-2 justify-content-end">
        <button class="btn btn-outline-danger btn-sm me-auto" *ngIf="hasExistingAdjustment"
                (click)="onDelete()" [disabled]="saving">
          Remove
        </button>
        <button class="btn btn-primary btn-sm" (click)="onSave()" [disabled]="saving || loadingAdjustment">
          <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
          Save
        </button>
        <button class="btn btn-secondary btn-sm" (click)="close()" [disabled]="saving">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .panel-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.15);
      z-index: 1040;
    }
    .adjustment-panel {
      position: fixed;
      top: 0;
      right: -420px;
      width: 400px;
      height: 100%;
      background: #fff;
      box-shadow: -2px 0 8px rgba(0,0,0,0.15);
      z-index: 1050;
      transition: right 0.25s ease;
      display: flex;
      flex-direction: column;
    }
    .adjustment-panel.open { right: 0; }
    .panel-body {
      overflow-y: auto;
      flex: 1;
    }
  `]
})
export class OsfiLcrAdjustmentPanelComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() line: OsfiLcrReportLine | null = null;
  @Input() currentValue: number | null = null;
  @Input() existingAdjustment: number | null = null;
  @Input() existingComment: string | null = null;
  @Input() saving = false;
  @Input() loadingAdjustment = false;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<AdjustmentSaveEvent>();
  @Output() deleted = new EventEmitter<number>(); // line id

  adjustmentValue: string = '';
  comment: string = '';
  submitted = false;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingAdjustment'] || changes['existingComment'] || changes['loadingAdjustment']) {
      if (this.isOpen && this.line && !this.loadingAdjustment) {
        this.adjustmentValue = this.existingAdjustment != null
          ? this.existingAdjustment.toString() : '';
        this.comment = this.existingComment ?? '';
        this.submitted = false;
      }
    }
    if (changes['isOpen'] && !this.isOpen) {
      this.submitted = false;
    }
  }

  get newAdjustedValue(): number | null {
    if (this.currentValue == null) return null;
    const adj = parseFloat(this.adjustmentValue);
    if (isNaN(adj)) return this.currentValue;
    return this.currentValue + adj;
  }

  get hasExistingAdjustment(): boolean {
    return this.existingAdjustment != null;
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

