import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ColGroupDef, ModuleRegistry, ValueFormatterParams } from 'ag-grid-community';
import { LcrReportService } from '../../core/services/lcr-report.service';
import { OsfiLcrMetricReportItem } from '../../shared/models/lcr-report.model';
import { LcrEnterpriseHeaderComponent } from '../../shared/components/lcr-enterprise-header/lcr-enterprise-header.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-osfi-lcr-metric-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './osfi-lcr-metric-report.component.html',
  styleUrl: './osfi-lcr-metric-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrMetricReportComponent implements OnInit {

  startDate = '';
  endDate = '';
  segment = 'Enterprise';
  segments = ['Enterprise', 'CAD Retail', 'US Retail', 'Wholesale'];
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
    if (!this.startDate || !this.endDate || !this.segment) return;

    this.loading = true;
    this.message = null;
    this.lcrService.getOsfiLcrMetricReport({
      segment: this.segment,
      startDate: this.startDate,
      endDate: this.endDate
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.buildGrid(data);
          this.loading = false;
          this.cd.markForCheck();
        },
        error: () => {
          this.message = { text: 'Failed to load OSFI LCR Metric report.', type: 'danger' };
          this.loading = false;
          this.cd.markForCheck();
        }
      });
  }

  private buildGrid(data: OsfiLcrMetricReportItem[]): void {
    if (!data || data.length === 0) {
      this.rowData = [];
      this.columnDefs = [];
      return;
    }

    // For metric report, we show a single segment with both weighted and unweighted
    const firstItem = data[0];
    const segData = firstItem.segment_data[0];
    if (!segData) { this.rowData = []; this.columnDefs = []; return; }

    const dates = segData.date_data.map(d => d.d_calander_date);
    const segName = segData.v_segment_name;

    // Build column definitions
    const nameCol: ColDef = {
      headerName: '',
      field: 'name',
      pinned: 'left',
      width: 500,
      headerComponent: LcrEnterpriseHeaderComponent,
      cellClass: 'fw-normal'
    };

    // Weighted (rw_amount) column group
    const weightedChildren: ColDef[] = [];
    dates.forEach(date => {
      weightedChildren.push({
        headerName: this.formatShortDate(date),
        field: `weighted.${date}`,
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value)
      });
    });
    if (dates.length >= 2) {
      weightedChildren.push({
        headerName: 'Variance',
        field: 'weighted.variance',
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value),
        cellClass: (params) => params.value != null && params.value < 0 ? 'text-danger' : ''
      });
      weightedChildren.push({
        headerName: '% Change',
        field: 'weighted.pctChange',
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) =>
          params.value != null ? params.value.toFixed(2) + '%' : '',
        cellClass: (params) => params.value != null && params.value < 0 ? 'text-danger' : ''
      });
    }

    const weightedGroup: ColGroupDef = {
      headerName: `${segName} (Weighted)`,
      children: weightedChildren
    };

    // Unweighted (amount) column group
    const unweightedChildren: ColDef[] = [];
    dates.forEach(date => {
      unweightedChildren.push({
        headerName: this.formatShortDate(date),
        field: `unweighted.${date}`,
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value)
      });
    });
    if (dates.length >= 2) {
      unweightedChildren.push({
        headerName: 'Variance',
        field: 'unweighted.variance',
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) => this.billionFormatter(params.value),
        cellClass: (params) => params.value != null && params.value < 0 ? 'text-danger' : ''
      });
      unweightedChildren.push({
        headerName: '% Change',
        field: 'unweighted.pctChange',
        width: 100,
        type: 'numericColumn',
        valueFormatter: (params: ValueFormatterParams) =>
          params.value != null ? params.value.toFixed(2) + '%' : '',
        cellClass: (params) => params.value != null && params.value < 0 ? 'text-danger' : ''
      });
    }

    const unweightedGroup: ColGroupDef = {
      headerName: segName,
      children: unweightedChildren
    };

    this.columnDefs = [nameCol, weightedGroup, unweightedGroup];

    // Build row data
    this.rowData = data.map(item => {
      const row: any = {
        name: item.v_report_line_name,
        reportLineCode: item.v_report_line_code,
        level01Desc: item.v_report_line_level_desc_01,
        level02Desc: item.v_report_line_level_desc_02
      };

      const seg = item.segment_data[0];
      if (seg) {
        // Weighted values
        seg.date_data.forEach(dd => {
          row[`weighted.${dd.d_calander_date}`] = dd.n_rw_amount_rpt_ccy;
          row[`unweighted.${dd.d_calander_date}`] = dd.n_amount_rpt_ccy;
        });

        if (seg.date_data.length >= 2) {
          const firstW = seg.date_data[0].n_rw_amount_rpt_ccy;
          const lastW = seg.date_data[seg.date_data.length - 1].n_rw_amount_rpt_ccy;
          row['weighted.variance'] = lastW - firstW;
          row['weighted.pctChange'] = firstW !== 0 ? ((lastW - firstW) / Math.abs(firstW)) * 100 : 0;

          const firstU = seg.date_data[0].n_amount_rpt_ccy;
          const lastU = seg.date_data[seg.date_data.length - 1].n_amount_rpt_ccy;
          row['unweighted.variance'] = lastU - firstU;
          row['unweighted.pctChange'] = firstU !== 0 ? ((lastU - firstU) / Math.abs(firstU)) * 100 : 0;
        }
      }

      return row;
    });
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
