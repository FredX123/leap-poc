import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LcrReportService } from '../../core/services/lcr-report.service';
import { CommentService } from '../../core/services/comment.service';
import { CommentThreadPanelComponent } from '../../shared/components/comment-thread-panel/comment-thread-panel.component';
import { CommentChildRow } from '../../shared/models/comment.model';
import {
  OsfiLcrReportItem,
  LcrSegmentHeader,
  LcrTreeRow,
  extractLevels
} from '../../shared/models/lcr-report.model';

@Component({
  selector: 'app-osfi-lcr-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentThreadPanelComponent],
  templateUrl: './osfi-lcr-report.component.html',
  styleUrl: './osfi-lcr-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrReportComponent {

  startDate = '2026-01-29';
  endDate = '2026-01-30';
  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  segments: LcrSegmentHeader[] = [];
  dates: string[] = [];
  treeRows: LcrTreeRow[] = [];
  activeMenu: { rowCode: string; segKey: string } | null = null;

  // Comment panel state
  commentPanelOpen = false;
  commentReportType = 'OSFI_LCR_REPORT';
  commentLineKey = '';
  commentLineName = '';
  commentSegmentName: string | null = null;
  commentChildRows: CommentChildRow[] = [];
  commentVariance: number | null = null;

  /** lineKey -> true for rows that have comments (leaf or bubbled-up parent) per segment */
  commentFlags: Record<string, Set<string>> = {};  // segmentName -> Set of lineCodes with comments

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private lcrService: LcrReportService,
    private commentService: CommentService
  ) {}

  onViewAnalytics(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    this.message = null;
    this.lcrService.getOsfiLcrReport({ startDate: this.startDate, endDate: this.endDate })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          this.buildTree(data);
          this.loading = false;
          this.cd.markForCheck();
          this.loadCommentCounts();
        },
        error: () => {
          this.message = { text: 'Failed to load OSFI LCR report.', type: 'danger' };
          this.loading = false;
          this.cd.markForCheck();
        }
      });
  }

  get visibleRows(): LcrTreeRow[] {
    return this.treeRows.filter(row => this.isRowVisible(row));
  }

  toggleRow(row: LcrTreeRow): void {
    if (row.expandable) {
      row.expanded = !row.expanded;
      this.cd.markForCheck();
    }
  }

  isRowVisible(row: LcrTreeRow): boolean {
    if (row.parentCode == null) return true;
    let current: LcrTreeRow = row;
    while (current.parentCode != null) {
      const parent = this.treeRows.find(r => r.code === current.parentCode);
      if (!parent) return false;
      if (!parent.expanded) return false;
      current = parent;
    }
    return true;
  }

  segKey(name: string): string {
    return name.replace(/\s+/g, '_').toLowerCase();
  }

  formatAmount(value: number | undefined): string {
    if (value == null) return '';
    const billions = value / 1_000_000_000;
    return billions.toFixed(1);
  }

  formatVariance(pct: number | undefined): string {
    if (pct == null || isNaN(pct)) return '';
    return Math.abs(pct).toFixed(1) + '%';
  }

  varianceClass(pct: number | undefined): string {
    if (pct == null || isNaN(pct) || pct === 0) return '';
    return pct < 0 ? 'text-danger' : 'text-success';
  }

  varianceArrow(pct: number | undefined): string {
    if (pct == null || isNaN(pct) || pct === 0) return '';
    return pct < 0 ? 'bi-arrow-down' : 'bi-arrow-up';
  }

  formatShortDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
  }

  get colsPerSegment(): number {
    return this.dates.length + 3; // dates + variance + comment + adjustment
  }

  toggleMenu(row: LcrTreeRow, segKey: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenu?.rowCode === row.code && this.activeMenu?.segKey === segKey) {
      this.activeMenu = null;
    } else {
      this.activeMenu = { rowCode: row.code, segKey };
    }
    this.cd.markForCheck();
  }

  isMenuOpen(row: LcrTreeRow, segKey: string): boolean {
    return this.activeMenu?.rowCode === row.code && this.activeMenu?.segKey === segKey;
  }

  onCommentClick(row: LcrTreeRow, segmentName: string, event: MouseEvent): void {
    event.stopPropagation();
    this.commentLineKey = row.code;
    this.commentLineName = row.name;
    this.commentSegmentName = segmentName;
    this.commentVariance = row.variancePct[this.segKey(segmentName)] ?? null;

    // Gather descendant rows for hierarchy view
    if (row.expandable) {
      this.commentChildRows = this.getDescendants(row.code, this.segKey(segmentName));
    } else {
      this.commentChildRows = [];
    }

    this.commentPanelOpen = true;
    this.cd.markForCheck();
  }

  hasCommentsForRow(row: LcrTreeRow, segmentName: string): boolean {
    return this.commentFlags[segmentName]?.has(row.code) ?? false;
  }

  onMenuAction(action: string, row: LcrTreeRow, segKey: string, segmentName?: string): void {
    this.activeMenu = null;
    if (action === 'comments') {
      this.commentLineKey = row.code;
      this.commentLineName = row.name;
      this.commentSegmentName = segmentName || null;
      this.commentVariance = row.variancePct[segKey] ?? null;
      this.commentChildRows = row.expandable ? this.getDescendants(row.code, segKey) : [];
      this.commentPanelOpen = true;
    }
    this.cd.markForCheck();
  }

  private getDescendants(parentCode: string, segKey: string): CommentChildRow[] {
    const descendants: CommentChildRow[] = [];
    const collect = (code: string) => {
      for (const row of this.treeRows) {
        if (row.parentCode === code) {
          descendants.push({ code: row.code, name: row.name, parentCode: row.parentCode, level: row.level, variance: row.variancePct[segKey] ?? null });
          if (row.expandable) collect(row.code);
        }
      }
    };
    collect(parentCode);
    return descendants;
  }

  closeCommentPanel(): void {
    this.commentPanelOpen = false;
    this.cd.markForCheck();
    // Refresh counts after panel close in case comments were added/deleted
    this.loadCommentCounts();
  }

  closeMenu(): void {
    if (this.activeMenu) {
      this.activeMenu = null;
      this.cd.markForCheck();
    }
  }

  private loadCommentCounts(): void {
    if (this.segments.length === 0) return;

    for (const seg of this.segments) {
      this.commentService.getCounts(this.commentReportType, seg.segmentName)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(counts => {
          const leafKeysWithComments = new Set<string>(
            Object.keys(counts).filter(k => counts[k] > 0)
          );
          // Bubble up: if any child has comments, mark the parent too
          const allCodes = new Set<string>();
          for (const lineKey of leafKeysWithComments) {
            allCodes.add(lineKey);
            // Walk up the tree to mark all ancestors
            let row = this.treeRows.find(r => r.code === lineKey);
            while (row?.parentCode) {
              allCodes.add(row.parentCode);
              row = this.treeRows.find(r => r.code === row!.parentCode);
            }
          }
          this.commentFlags[seg.segmentName] = allCodes;
          this.cd.markForCheck();
        });
    }
  }

  private buildTree(data: OsfiLcrReportItem[]): void {
    if (!data || data.length === 0) {
      this.treeRows = [];
      this.segments = [];
      this.dates = [];
      return;
    }

    const firstItem = data[0];
    this.segments = firstItem.segment_data
      .map(s => ({ segmentName: s.v_segment_name, segmentOrder: s.n_segment_order }))
      .sort((a, b) => a.segmentOrder - b.segmentOrder);
    this.dates = firstItem.segment_data[0]?.date_data.map(d => d.d_calander_date) || [];

    const rows: LcrTreeRow[] = [];
    const groupNodes = new Map<string, LcrTreeRow>();

    for (const item of data) {
      const levels = extractLevels(item).map(l => ({
        code: l.v_level_code,
        desc: (l.v_level_desc || '').trim()
      }));

      if (levels.length === 0) {
        // Standalone items (no level codes) — render as level-1 leaves
        const row: LcrTreeRow = {
          level: 1, name: `(${item.v_report_line_code}) ${item.v_report_line_name}`,
          code: item.v_report_line_code,
          expanded: false, expandable: false,
          parentCode: null, grandparentCode: null, amounts: {}, variancePct: {}
        };
        this.populateLeafAmounts(row, item);
        rows.push(row);
        continue;
      }

      // Ensure each group node in the hierarchy path exists
      let parentCompositeKey: string | null = null;
      for (let i = 0; i < levels.length; i++) {
        const compositeKey = levels.slice(0, i + 1).map(l => l.code).join('|');
        if (!groupNodes.has(compositeKey)) {
          const groupRow: LcrTreeRow = {
            level: (i + 1) as 1 | 2 | 3,
            name: levels[i].desc,
            code: compositeKey,
            expanded: i === 0, expandable: true,
            parentCode: parentCompositeKey,
            grandparentCode: null,
            amounts: {}, variancePct: {}
          };
          groupNodes.set(compositeKey, groupRow);
          rows.push(groupRow);
        }
        parentCompositeKey = compositeKey;
      }

      // Add leaf row
      const leafCompositeKey = parentCompositeKey
        ? parentCompositeKey + '|' + item.v_report_line_code
        : item.v_report_line_code;
      const leafRow: LcrTreeRow = {
        level: (levels.length + 1) as 1 | 2 | 3,
        name: `(${item.v_report_line_code}) ${item.v_report_line_name}`,
        code: leafCompositeKey,
        expanded: false, expandable: false,
        parentCode: parentCompositeKey,
        grandparentCode: null,
        amounts: {}, variancePct: {}
      };
      this.populateLeafAmounts(leafRow, item);
      rows.push(leafRow);
    }

    // Re-order into depth-first tree order
    const ordered: LcrTreeRow[] = [];
    const roots = rows.filter(r => r.parentCode == null);
    const addWithChildren = (parent: LcrTreeRow): void => {
      ordered.push(parent);
      const children = rows.filter(r => r.parentCode === parent.code);
      for (const child of children) addWithChildren(child);
    };
    for (const root of roots) addWithChildren(root);

    // Aggregate from bottom up
    const maxLevel = Math.max(...ordered.map(r => r.level));
    for (let lvl = maxLevel - 1; lvl >= 1; lvl--) {
      for (const row of ordered) {
        if (row.level === lvl && row.expandable) {
          const children = ordered.filter(r => r.parentCode === row.code);
          this.aggregateAmounts(row, children);
        }
      }
    }

    this.treeRows = ordered;
  }

  private populateLeafAmounts(row: LcrTreeRow, item: OsfiLcrReportItem): void {
    for (const seg of item.segment_data) {
      const sk = this.segKey(seg.v_segment_name);
      row.amounts[sk] = {};
      for (const dd of seg.date_data) {
        row.amounts[sk][dd.d_calander_date] = dd.n_amount_rpt_ccy;
      }
      if (seg.date_data.length >= 2) {
        const first = seg.date_data[0].n_amount_rpt_ccy;
        const last = seg.date_data[seg.date_data.length - 1].n_amount_rpt_ccy;
        row.variancePct[sk] = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
      }
    }
  }

  private aggregateAmounts(parent: LcrTreeRow, children: LcrTreeRow[]): void {
    for (const seg of this.segments) {
      const sk = this.segKey(seg.segmentName);
      parent.amounts[sk] = {};
      for (const date of this.dates) {
        let sum = 0;
        for (const child of children) {
          sum += child.amounts[sk]?.[date] ?? 0;
        }
        parent.amounts[sk][date] = sum;
      }
      if (this.dates.length >= 2) {
        const first = parent.amounts[sk][this.dates[0]] ?? 0;
        const last = parent.amounts[sk][this.dates[this.dates.length - 1]] ?? 0;
        parent.variancePct[sk] = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
      }
    }
  }
}
