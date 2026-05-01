import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LcrCalcReportService } from '../../core/services/lcr-calc-report.service';
import { AuthService } from '../../core/services/auth.service';
import {
  LcrCalcReportDto,
  LcrCalcLineDto,
  LcrCalcAdjustmentRequest
} from '../../shared/models/lcr-calc-report.model';
import {
  LcrAdjustmentPanelComponent,
  AdjustmentSaveEvent
} from '../../shared/components/lcr-adjustment-panel/lcr-adjustment-panel.component';

@Component({
  selector: 'app-lcr-report',
  standalone: true,
  imports: [CommonModule, FormsModule, LcrAdjustmentPanelComponent],
  templateUrl: './lcr-report.component.html',
  styleUrl: './lcr-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LcrReportComponent {

  calcId: number = 6059;
  reportingDate = '2026-03-31';
  selectedCurrency = 'ALL';
  showAdjustments = true;

  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  report: LcrCalcReportDto | null = null;
  availableCurrencies: string[] = [];

  // Adjustment panel state
  adjustmentPanelOpen = false;
  adjustmentLine: LcrCalcLineDto | null = null;
  adjustmentSaving = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private service: LcrCalcReportService,
    public auth: AuthService
  ) {}

  onLoadReport(): void {
    if (!this.calcId || !this.reportingDate) return;

    this.loading = true;
    this.message = null;
    this.service.getReport({
      calcId: this.calcId,
      reportingDate: this.reportingDate,
      currency: this.selectedCurrency
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.report = data;
          this.availableCurrencies = data.availableCurrencies;
          this.loading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.message = { text: 'Failed to load LCR report.', type: 'danger' };
          this.loading = false;
          this.cd.markForCheck();
        }
      });
  }

  onCurrencyChange(currency: string): void {
    this.selectedCurrency = currency;
    this.onLoadReport();
  }

  formatAmount(value: number | null | undefined): string {
    if (value == null) return '';
    const formatted = new Intl.NumberFormat('en-CA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(value);
    return '$' + formatted;
  }

  isNegative(value: number | null | undefined): boolean {
    return value != null && value < 0;
  }

  getDisplayMarketValue(line: LcrCalcLineDto): number | null {
    if (this.showAdjustments && line.adjustmentValue != null && line.marketValue != null) {
      return line.marketValue + line.adjustmentValue;
    }
    return line.marketValue;
  }

  getDisplayWeightedAmount(line: LcrCalcLineDto): number | null {
    if (this.showAdjustments && line.adjustmentValue != null && line.marketValue != null && line.weight != null) {
      return (line.marketValue + line.adjustmentValue) * line.weight;
    }
    return line.weightedAmount;
  }

  hasAdjustment(line: LcrCalcLineDto): boolean {
    return line.adjustmentValue != null;
  }

  // --- Adjustment panel ---

  canEdit(): boolean {
    return this.auth.hasAnyGroup('GRP_WRITE');
  }

  openAdjustmentPanel(line: LcrCalcLineDto): void {
    if (!this.canEdit() || !line.lineCode) return;
    this.adjustmentLine = line;
    this.adjustmentPanelOpen = true;
    this.cd.markForCheck();
  }

  closeAdjustmentPanel(): void {
    this.adjustmentPanelOpen = false;
    this.adjustmentLine = null;
    this.cd.markForCheck();
  }

  onAdjustmentSave(event: AdjustmentSaveEvent): void {
    if (!this.report) return;
    this.adjustmentSaving = true;

    const request: LcrCalcAdjustmentRequest = {
      calcId: this.report.calcId,
      lineId: event.lineId,
      currency: this.selectedCurrency,
      adjustmentValue: event.adjustmentValue,
      comment: event.comment
    };

    this.service.saveAdjustment(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adjustmentSaving = false;
          this.closeAdjustmentPanel();
          this.onLoadReport();
        },
        error: () => {
          this.adjustmentSaving = false;
          this.message = { text: 'Failed to save adjustment.', type: 'danger' };
          this.cd.markForCheck();
        }
      });
  }

  onAdjustmentDelete(lineId: number): void {
    if (!this.report) return;
    this.adjustmentSaving = true;

    this.service.deleteAdjustment(this.report.calcId, lineId, this.selectedCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.adjustmentSaving = false;
          this.closeAdjustmentPanel();
          this.onLoadReport();
        },
        error: () => {
          this.adjustmentSaving = false;
          this.message = { text: 'Failed to delete adjustment.', type: 'danger' };
          this.cd.markForCheck();
        }
      });
  }

  formatWeight(weight: number | null): string {
    if (weight == null) return '';
    return weight.toFixed(2);
  }
}
