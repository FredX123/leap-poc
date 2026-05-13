import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LcrReportService } from '../../core/services/lcr-report.service';
import { AuthService } from '../../core/services/auth.service';
import {
  OsfiLcrReportDto,
  OsfiLcrCalculatedData,
  OsfiLcrReportLine,
  LCR_CURRENCIES,
  OsfiLcrAdjustmentRequest
} from '../../shared/models/lcr-report.model';
import { OsfiLcrAdjustmentPanelComponent, AdjustmentSaveEvent } from './osfi-lcr-adjustment-panel.component';
import { OSFI_LCR_LINES } from '../../shared/data/osfi-lcr-lines';

/** A section groups lines under a section header + subsection header */
export interface ReportSection {
  sectionName: string;
  subsectionName: string;
  lines: OsfiLcrReportLine[];
}

@Component({
  selector: 'app-osfi-lcr-report',
  standalone: true,
  imports: [CommonModule, FormsModule, OsfiLcrAdjustmentPanelComponent],
  templateUrl: './osfi-lcr-report.component.html',
  styleUrl: './osfi-lcr-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrReportComponent {

  calcId: number = 6059;
  reportingDate = '2026-03-31';

  /** Currency tabs */
  currencies = LCR_CURRENCIES;
  selectedCurrency = 'ALL';

  /** Adjustment mode toggle */
  adjustmentMode = false;

  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  report: OsfiLcrReportDto | null = null;

  /** Calculated data indexed by recordId for quick lookup */
  calcDataMap: Record<string, OsfiLcrCalculatedData> = {};

  /** Adjustments indexed by lineId for quick lookup */
  adjustmentMap: Record<string, { value: number; comment: string }> = {};

  /** Sections grouped from lines */
  sections: ReportSection[] = [];

  /** Adjustment panel state */
  adjustmentPanelOpen = false;
  adjustmentLine: OsfiLcrReportLine | null = null;
  adjustmentSaving = false;
  adjustmentLoading = false;
  existingAdjustmentValue: number | null = null;
  existingAdjustmentComment: string | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private service: LcrReportService,
    private auth: AuthService
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
          this.buildCalcDataMap();
          this.buildAdjustmentMap();
          this.buildSections();
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

  selectCurrency(currency: string): void {
    if (this.selectedCurrency === currency) return;
    this.selectedCurrency = currency;
    if (this.report) {
      this.onLoadReport();
    }
  }

  private buildCalcDataMap(): void {
    this.calcDataMap = {};
    if (!this.report) return;
    for (const d of this.report.calculatedData) {
      this.calcDataMap[d.recordId] = d;
    }
  }

  private buildAdjustmentMap(): void {
    this.adjustmentMap = {};
    if (!this.report?.adjustments) return;
    for (const adj of this.report.adjustments) {
      this.adjustmentMap[adj.lineCode] = { value: adj.adjustmentValue, comment: adj.comment };
    }
  }

  /** Returns true if a line has a saved adjustment */
  hasAdjustment(line: OsfiLcrReportLine): boolean {
    return this.adjustmentMap[line.lineCode] != null;
  }

  /** Returns the adjustment info for a line, or null */
  getAdjustmentInfo(line: OsfiLcrReportLine): { value: number; comment: string } | null {
    return this.adjustmentMap[line.lineCode] ?? null;
  }

  private buildSections(): void {
    this.sections = [];
    if (!this.report) return;

    let currentSection = '';
    let currentSubsection = '';
    let currentLines: OsfiLcrReportLine[] = [];

    for (const line of OSFI_LCR_LINES) {
      if (line.lineType === 'section') {
        currentSection = line.lineName;
        continue;
      }
      if (line.lineType === 'subsection') {
        if (currentLines.length > 0) {
          this.sections.push({
            sectionName: currentSection,
            subsectionName: currentSubsection,
            lines: currentLines
          });
        }
        currentSubsection = line.lineName;
        currentLines = [];
        continue;
      }
      currentLines.push(line);
    }
    if (currentLines.length > 0) {
      this.sections.push({
        sectionName: currentSection,
        subsectionName: currentSubsection,
        lines: currentLines
      });
    }
  }

  /**
   * Gets the display value for a line code.
   * calculatedData recordIds use "D" prefix: e.g., line "11001" -> recordId "D11001"
   * Uses calculatedValue (which preserves sign) instead of displayValue.
   */
  getValue(lineCode: string | null): number | null {
    if (!lineCode) return null;
    const record = this.calcDataMap['D' + lineCode];
    return record?.calculatedValue ?? null;
  }

  /** Returns true if the line is a subheader (grey row, no data) */
  isSubheader(line: OsfiLcrReportLine): boolean {
    return line.lineType === 'subheader';
  }

  /** Returns true if the line is a total/summary row (99xxx codes) */
  isTotalRow(line: OsfiLcrReportLine): boolean {
    return line.lineCode.startsWith('99');
  }

  /** True when the line has no market-value data (grey-out value cells) */
  hasNoValue(line: OsfiLcrReportLine): boolean {
    return this.isSubheader(line) || this.getValue(line.lineCode) === null;
  }

  /** True when the line has no weighted data (grey-out weighted cells) */
  hasNoWeighted(line: OsfiLcrReportLine): boolean {
    return this.isSubheader(line) || this.getValue(line.weightedLineCode) === null;
  }

  /** Determines indentation class */
  getIndentClass(line: OsfiLcrReportLine, section: ReportSection): string {
    if (line.lineType === 'subheader') return 'idented0';
    if (line.lineCode.startsWith('99')) return 'idented0';

    const idx = section.lines.indexOf(line);
    for (let i = idx - 1; i >= 0; i--) {
      if (section.lines[i].lineType === 'subheader') {
        return 'idented1';
      }
    }
    return 'idented0';
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null) return '';
    const formatted = new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    }).format(Math.abs(value));
    return (value < 0 ? '$-' : '$') + formatted;
  }

  formatWeight(value: number | null | undefined): string {
    if (value == null) return '';
    return value.toFixed(2);
  }

  isNegative(value: number | null | undefined): boolean {
    return value != null && value < 0;
  }

  trackByOrder(_: number, line: OsfiLcrReportLine): number {
    return line.displayOrder;
  }

  trackBySection(idx: number): number {
    return idx;
  }

  /** Get unique section name only on first occurrence */
  getSectionName(idx: number): string | null {
    if (idx === 0) return this.sections[0].sectionName;
    if (this.sections[idx].sectionName !== this.sections[idx - 1].sectionName) {
      return this.sections[idx].sectionName;
    }
    return null;
  }

  // --- Adjustment ---

  canEdit(): boolean {
    return this.auth.hasAnyGroup('GRP_WRITE');
  }

  /** Returns true if user can click on market value cell to adjust it */
  isClickable(line: OsfiLcrReportLine): boolean {
    return this.adjustmentMode && this.canEdit() && line.lineType === 'data'
      && !this.isSubheader(line) && this.getValue(line.lineCode) !== null;
  }

  openAdjustmentPanel(line: OsfiLcrReportLine): void {
    if (!this.isClickable(line)) return;
    this.adjustmentLine = line;
    this.adjustmentPanelOpen = true;
    this.existingAdjustmentValue = null;
    this.existingAdjustmentComment = null;

    // Pre-fill from local map if available
    const localAdj = this.adjustmentMap[line.lineCode];
    if (localAdj) {
      this.existingAdjustmentValue = localAdj.value;
      this.existingAdjustmentComment = localAdj.comment;
      this.adjustmentLoading = false;
      this.cd.markForCheck();
      return;
    }

    this.adjustmentLoading = true;
    this.cd.markForCheck();

    // Load existing adjustment from backend
    this.service.getAdjustment(this.calcId, line.lineCode, this.selectedCurrency)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (dto) => {
          if (dto) {
            this.existingAdjustmentValue = dto.adjustmentValue;
            this.existingAdjustmentComment = dto.comment;
          }
          this.adjustmentLoading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.adjustmentLoading = false;
          this.cd.markForCheck();
        }
      });
  }

  closeAdjustmentPanel(): void {
    this.adjustmentPanelOpen = false;
    this.adjustmentLine = null;
    this.cd.markForCheck();
  }

  onAdjustmentSave(event: AdjustmentSaveEvent): void {
    if (!this.report) return;
    this.adjustmentSaving = true;
    const request: OsfiLcrAdjustmentRequest = {
      calcId: this.calcId,
      lineCode: event.lineCode,
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

  onAdjustmentDelete(lineCode: string): void {
    if (!this.report) return;
    this.adjustmentSaving = true;
    this.service.deleteAdjustment(this.calcId, lineCode, this.selectedCurrency)
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
}
