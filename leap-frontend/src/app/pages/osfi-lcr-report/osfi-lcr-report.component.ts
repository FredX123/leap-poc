import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LcrReportService } from '../../core/services/lcr-report.service';
import {
  OsfiLcrReportDto,
  OsfiLcrCalculatedData,
  OsfiLcrReferenceData
} from '../../shared/models/lcr-report.model';

@Component({
  selector: 'app-osfi-lcr-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './osfi-lcr-report.component.html',
  styleUrl: './osfi-lcr-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrReportComponent {

  calcId: number = 6059;
  reportingDate = '2026-03-31';
  selectedCurrency = 'ALL';

  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  report: OsfiLcrReportDto | null = null;

  // View toggle
  activeTab: 'calculated' | 'reference' = 'calculated';

  // Filtering
  typeFilter = '';
  referenceRowFilter = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private service: LcrReportService
  ) {}

  onLoadReport(): void {
    if (!this.calcId) return;

    this.loading = true;
    this.message = null;
    this.service.getOsfiLcrReport({
      calcId: this.calcId,
      reportingDate: this.reportingDate,
      currency: this.selectedCurrency
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.report = data;
          this.loading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.message = { text: 'Failed to load OSFI LCR report.', type: 'danger' };
          this.loading = false;
          this.cd.markForCheck();
        }
      });
  }

  get filteredCalculatedData(): OsfiLcrCalculatedData[] {
    if (!this.report) return [];
    let data = this.report.calculatedData;
    if (this.typeFilter) {
      data = data.filter(d => d.type === this.typeFilter);
    }
    return data;
  }

  get filteredReferenceData(): OsfiLcrReferenceData[] {
    if (!this.report) return [];
    let data = this.report.referenceData;
    if (this.referenceRowFilter) {
      const filter = parseInt(this.referenceRowFilter, 10);
      if (!isNaN(filter)) {
        data = data.filter(d => d.reporting_row === filter);
      }
    }
    return data;
  }

  get calculatedDataTypes(): string[] {
    if (!this.report) return [];
    return [...new Set(this.report.calculatedData.map(d => d.type))].sort();
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null) return '';
    return new Intl.NumberFormat('en-CA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 15
    }).format(value);
  }

  isNegative(value: number | null | undefined): boolean {
    return value != null && value < 0;
  }

  trackByRecordId(_: number, item: OsfiLcrCalculatedData): string {
    return item.recordId;
  }

  trackByRefIdx(index: number): number {
    return index;
  }
}
