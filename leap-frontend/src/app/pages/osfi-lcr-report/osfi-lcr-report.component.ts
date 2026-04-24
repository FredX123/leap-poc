import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ColGroupDef, ModuleRegistry, ValueFormatterParams } from 'ag-grid-community';
import { LcrReportService } from '../../core/services/lcr-report.service';
import { OsfiLcrReportItem } from '../../shared/models/lcr-report.model';
import { LcrEnterpriseHeaderComponent } from '../../shared/components/lcr-enterprise-header/lcr-enterprise-header.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-osfi-lcr-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './osfi-lcr-report.component.html',
  styleUrl: './osfi-lcr-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrReportComponent implements OnInit {

  startDate = '';
  endDate = '';
  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  rowData: any[] = [];
  columnDefs: (ColDef | ColGroupDef)[] = [];
  defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    minWidth: 100
  };

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private lcrService: LcrReportService
  ) {}

  ngOnInit(): void {}

  onViewAnalytics(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    this.message = null;
    this.lcrService.getOsfiLcrReport({ startDate: this.startDate, endDate: this.endDate })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.buildGrid(data);
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

  private buildGrid(data: OsfiLcrReportItem[]): void {
    if (!data || data.length === 0) {
      this.rowData = [];
      this.columnDefs = [];
      return;
    }

    // Extract unique segments (ordered) and dates from the first item
    const segments = data[0].segment_data
      .sort((a, b) => a.n_segment_order - b.n_segment_order);
    const dates = segments[0]?.date_data.map(d => d.d_calander_date) || [];

    // Build column definitions
    const nameCol: ColDef = {
      headerName: '',
      field: 'name',
      pinned: 'left',
      width: 250,
      headerComponent: LcrEnterpriseHeaderComponent,
      cellClass: 'fw-normal'
    };

    const segmentGroups: ColGroupDef[] = segments.map(seg => {
      const children: ColDef[] = [];

      dates.forEach(date => {
        const shortDate = this.formatShortDate(date);
        children.push({
          headerName: shortDate,
          field: `${this.segmentKey(seg.v_segment_name)}.${date}`,
          width: 100,
          type: 'numericColumn',
          valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value)
        });
      });

      // Variance column (last date - first date)
      if (dates.length >= 2) {
        children.push({
          headerName: 'Variance',
          field: `${this.segmentKey(seg.v_segment_name)}.variance`,
          width: 100,
          type: 'numericColumn',
          valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value),
          cellClass: (params) => {
            if (params.value == null) return '';
            return params.value < 0 ? 'text-danger' : '';
          }
        });
        children.push({
          headerName: '% Change',
          field: `${this.segmentKey(seg.v_segment_name)}.pctChange`,
          width: 100,
          type: 'numericColumn',
          valueFormatter: (params: ValueFormatterParams) => {
            if (params.value == null) return '';
            return params.value.toFixed(2) + '%';
          },
          cellClass: (params) => {
            if (params.value == null) return '';
            return params.value < 0 ? 'text-danger' : '';
          }
        });
      }

      return {
        headerName: seg.v_segment_name,
        children
      };
    });

    this.columnDefs = [nameCol, ...segmentGroups];

    // Build row data
    this.rowData = data.map(item => {
      const row: any = {
        name: item.v_report_line_name,
        reportLineCode: item.v_report_line_code,
        level01Desc: item.v_report_line_level_desc_01,
        level02Desc: item.v_report_line_level_desc_02
      };

      item.segment_data.forEach(seg => {
        const key = this.segmentKey(seg.v_segment_name);
        seg.date_data.forEach(dd => {
          row[`${key}.${dd.d_calander_date}`] = dd.n_amount_rpt_ccy;
        });

        // Compute variance and % change
        if (seg.date_data.length >= 2) {
          const first = seg.date_data[0].n_amount_rpt_ccy;
          const last = seg.date_data[seg.date_data.length - 1].n_amount_rpt_ccy;
          row[`${key}.variance`] = last - first;
          row[`${key}.pctChange`] = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
        }
      });

      return row;
    });
  }

  private segmentKey(name: string): string {
    return name.replace(/\s+/g, '_').toLowerCase();
  }

  private formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private billionFormatter(value: number | null | undefined): string {
    if (value == null) return '';
    const billions = value / 1_000_000_000;
    return billions.toFixed(2);
  }
}
