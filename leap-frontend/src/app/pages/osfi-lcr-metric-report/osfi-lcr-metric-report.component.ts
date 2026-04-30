import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LcrReportService } from '../../core/services/lcr-report.service';
import { CommentService } from '../../core/services/comment.service';
import { CommentThreadPanelComponent } from '../../shared/components/comment-thread-panel/comment-thread-panel.component';
import { CommentChildRow } from '../../shared/models/comment.model';
import {
  OsfiLcrMetricReportItem,
  LcrMetricTreeRow,
  extractLevels
} from '../../shared/models/lcr-report.model';

@Component({
  selector: 'app-osfi-lcr-metric-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentThreadPanelComponent],
  templateUrl: './osfi-lcr-metric-report.component.html',
  styleUrl: './osfi-lcr-metric-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OsfiLcrMetricReportComponent {

  startDate = '2026-01-29';
  endDate = '2026-01-30';
  segment = 'Enterprise';
  segments = ['Enterprise', 'CA Retail', 'US Retail', 'Wholesale'];
  loading = false;
  message: { text: string; type: 'success' | 'danger' } | null = null;

  dates: string[] = [];
  segmentName = '';
  treeRows: LcrMetricTreeRow[] = [];
  activeMenu: { rowCode: string; group: string } | null = null;

  // Comment panel state
  commentPanelOpen = false;
  commentReportType = 'OSFI_LCR_METRIC_REPORT';
  commentLineKey = '';
  commentLineName = '';
  commentSegmentName: string | null = null;
  commentChildRows: CommentChildRow[] = [];
  commentVariance: number | null = null;

  /** Row codes with comments, tracked separately per group */
  weightedCommentCodes = new Set<string>();
  unweightedCommentCodes = new Set<string>();

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    private lcrService: LcrReportService,
    private commentService: CommentService
  ) {}

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
          this.buildTree(data);
          this.loading = false;
          this.cd.markForCheck();
          this.loadCommentCounts();
        },
        error: () => {
          this.message = { text: 'Failed to load OSFI LCR Metric report.', type: 'danger' };
          this.loading = false;
          this.cd.markForCheck();
        }
      });
  }

  get visibleRows(): LcrMetricTreeRow[] {
    return this.treeRows.filter(row => this.isRowVisible(row));
  }

  toggleRow(row: LcrMetricTreeRow): void {
    if (row.expandable) {
      row.expanded = !row.expanded;
      this.cd.markForCheck();
    }
  }

  isRowVisible(row: LcrMetricTreeRow): boolean {
    if (row.level === 1) return true;
    // Walk up the parent chain — all ancestors must be expanded
    let current = row;
    while (current.parentCode != null) {
      const parent = this.treeRows.find(r => r.code === current.parentCode && r.level < current.level);
      if (!parent) return false;
      if (!parent.expanded) return false;
      current = parent;
    }
    return true;
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

  get colsPerGroup(): number {
    return this.dates.length + 3; // dates + variance + comment + adjustment
  }

  toggleMenu(row: LcrMetricTreeRow, group: string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenu?.rowCode === row.code && this.activeMenu?.group === group) {
      this.activeMenu = null;
    } else {
      this.activeMenu = { rowCode: row.code, group };
    }
    this.cd.markForCheck();
  }

  isMenuOpen(row: LcrMetricTreeRow, group: string): boolean {
    return this.activeMenu?.rowCode === row.code && this.activeMenu?.group === group;
  }

  onCommentClick(row: LcrMetricTreeRow, group: 'W' | 'U', event: MouseEvent): void {
    event.stopPropagation();
    this.commentLineKey = row.code + '|' + group;
    this.commentLineName = row.name;
    this.commentSegmentName = this.segmentName || null;
    this.commentVariance = group === 'W' ? row.weightedVariancePct : row.unweightedVariancePct;
    this.commentChildRows = row.expandable ? this.getDescendants(row.code, group) : [];
    this.commentPanelOpen = true;
    this.cd.markForCheck();
  }

  hasCommentsForRow(row: LcrMetricTreeRow, group: 'W' | 'U'): boolean {
    return group === 'W'
      ? this.weightedCommentCodes.has(row.code)
      : this.unweightedCommentCodes.has(row.code);
  }

  onMenuAction(action: string, row: LcrMetricTreeRow, group: 'W' | 'U'): void {
    this.activeMenu = null;
    if (action === 'comments') {
      this.commentLineKey = row.code + '|' + group;
      this.commentLineName = row.name;
      this.commentSegmentName = this.segmentName || null;
      this.commentVariance = group === 'W' ? row.weightedVariancePct : row.unweightedVariancePct;
      this.commentChildRows = row.expandable ? this.getDescendants(row.code, group) : [];
      this.commentPanelOpen = true;
    }
    this.cd.markForCheck();
  }

  private getDescendants(parentCode: string, group: 'W' | 'U'): CommentChildRow[] {
    const descendants: CommentChildRow[] = [];
    const collect = (code: string) => {
      for (const row of this.treeRows) {
        if (row.parentCode === code) {
          const v = group === 'W' ? row.weightedVariancePct : row.unweightedVariancePct;
          descendants.push({ code: row.code + '|' + group, name: row.name, parentCode: row.parentCode ? row.parentCode + '|' + group : null, level: row.level, variance: v ?? null });
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
    this.loadCommentCounts();
  }

  closeMenu(): void {
    if (this.activeMenu) {
      this.activeMenu = null;
      this.cd.markForCheck();
    }
  }

  private loadCommentCounts(): void {
    if (!this.segmentName) return;

    this.commentService.getCounts(this.commentReportType, this.segmentName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(counts => {
        const wCodes = new Set<string>();
        const uCodes = new Set<string>();

        const bubbleUp = (baseCode: string, targetSet: Set<string>) => {
          targetSet.add(baseCode);
          let row = this.treeRows.find(r => r.code === baseCode);
          while (row?.parentCode) {
            targetSet.add(row.parentCode);
            row = this.treeRows.find(r => r.code === row!.parentCode);
          }
        };

        for (const [lineKey, count] of Object.entries(counts)) {
          if (count <= 0) continue;

          if (lineKey.endsWith('|W')) {
            bubbleUp(lineKey.slice(0, -2), wCodes);
          } else if (lineKey.endsWith('|U')) {
            bubbleUp(lineKey.slice(0, -2), uCodes);
          } else {
            // Legacy key without group suffix — show on both
            bubbleUp(lineKey, wCodes);
            bubbleUp(lineKey, uCodes);
          }
        }

        this.weightedCommentCodes = wCodes;
        this.unweightedCommentCodes = uCodes;
        this.cd.markForCheck();
      });
  }

  private buildTree(data: OsfiLcrMetricReportItem[]): void {
    if (!data || data.length === 0) {
      this.treeRows = [];
      this.dates = [];
      this.segmentName = '';
      return;
    }

    // Merge items with same name + same level code hierarchy
    data = this.mergeItems(data);

    const firstItem = data[0];
    const segData = firstItem.segment_data.find(s => s.v_segment_name === this.segment)
      || firstItem.segment_data[0];
    if (!segData) { this.treeRows = []; this.dates = []; return; }

    this.segmentName = segData.v_segment_name;
    this.dates = segData.date_data.map(d => d.d_calander_date);

    // Build a generic N-level tree using all available level codes
    const rows: LcrMetricTreeRow[] = [];
    // Track which group nodes have been created: compositeKey -> row
    const groupNodes = new Map<string, LcrMetricTreeRow>();

    for (const item of data) {
      // Collect the hierarchy levels present on this item
      const levels = extractLevels(item).map(l => ({
        code: l.v_level_code,
        desc: (l.v_level_desc || '').trim()
      }));

      // Ensure each group node in the path exists
      let parentCode: string | null = null;
      for (let i = 0; i < levels.length; i++) {
        const compositeKey = levels.slice(0, i + 1).map(l => l.code).join('|');
        if (!groupNodes.has(compositeKey)) {
          const groupRow: LcrMetricTreeRow = {
            level: i + 1,
            name: levels[i].desc,
            code: levels[i].code,
            expanded: i === 0,
            expandable: true,
            parentCode,
            grandparentCode: null,
            weightedAmounts: {},
            weightedVariancePct: 0,
            unweightedAmounts: {},
            unweightedVariancePct: 0
          };
          groupNodes.set(compositeKey, groupRow);
          rows.push(groupRow);
        }
        parentCode = levels[i].code;
      }

      // Add leaf row
      const leafLevel = levels.length + 1;
      const leafRow: LcrMetricTreeRow = {
        level: leafLevel,
        name: item.v_report_line_name,
        code: item.v_report_line_code,
        expanded: false,
        expandable: false,
        parentCode,
        grandparentCode: null,
        weightedAmounts: {},
        weightedVariancePct: 0,
        unweightedAmounts: {},
        unweightedVariancePct: 0
      };
      const seg = item.segment_data.find(s => s.v_segment_name === this.segment)
        || item.segment_data[0];
      if (seg) {
        for (const dd of seg.date_data) {
          leafRow.weightedAmounts[dd.d_calander_date] = dd.n_rw_amount_rpt_ccy;
          leafRow.unweightedAmounts[dd.d_calander_date] = dd.n_amount_rpt_ccy;
        }
        if (seg.date_data.length >= 2) {
          const firstW = seg.date_data[0].n_rw_amount_rpt_ccy;
          const lastW = seg.date_data[seg.date_data.length - 1].n_rw_amount_rpt_ccy;
          leafRow.weightedVariancePct = firstW !== 0 ? ((lastW - firstW) / Math.abs(firstW)) * 100 : 0;
          const firstU = seg.date_data[0].n_amount_rpt_ccy;
          const lastU = seg.date_data[seg.date_data.length - 1].n_amount_rpt_ccy;
          leafRow.unweightedVariancePct = firstU !== 0 ? ((lastU - firstU) / Math.abs(firstU)) * 100 : 0;
        }
      }
      rows.push(leafRow);
    }

    // Collapse groups where all children have the same name as the parent
    this.collapseRedundantGroups(rows);

    // Sort rows into tree order: depth-first by insertion order (already correct)
    // Re-order so children appear right after their parent
    const ordered = this.orderTreeRows(rows);

    // Aggregate from bottom up: find max level and aggregate down
    const maxLevel = Math.max(...ordered.map(r => r.level));
    for (let lvl = maxLevel - 1; lvl >= 1; lvl--) {
      for (const row of ordered) {
        if (row.level === lvl && row.expandable) {
          const children = ordered.filter(r => r.parentCode === row.code && r.level === lvl + 1);
          this.aggregateMetricAmounts(row, children);
        }
      }
    }

    this.treeRows = ordered;
  }

  private collapseRedundantGroups(rows: LcrMetricTreeRow[]): void {
    // For each expandable group, if ALL its direct children have the exact same name,
    // remove the children and make the group a leaf (non-expandable) with summed amounts.
    let changed = true;
    while (changed) {
      changed = false;
      for (const row of rows) {
        if (!row.expandable) continue;
        const children = rows.filter(r => r.parentCode === row.code && r.level === row.level + 1);
        if (children.length === 0) continue;
        const allSameName = children.every(c => c.name === row.name);
        if (!allSameName) continue;

        // Sum all descendant leaf amounts into this node
        const leaves = this.collectLeaves(row, rows);
        for (const date of this.dates) {
          let sumW = 0, sumU = 0;
          for (const leaf of leaves) {
            sumW += leaf.weightedAmounts[date] ?? 0;
            sumU += leaf.unweightedAmounts[date] ?? 0;
          }
          row.weightedAmounts[date] = sumW;
          row.unweightedAmounts[date] = sumU;
        }
        if (this.dates.length >= 2) {
          const firstW = row.weightedAmounts[this.dates[0]] ?? 0;
          const lastW = row.weightedAmounts[this.dates[this.dates.length - 1]] ?? 0;
          row.weightedVariancePct = firstW !== 0 ? ((lastW - firstW) / Math.abs(firstW)) * 100 : 0;
          const firstU = row.unweightedAmounts[this.dates[0]] ?? 0;
          const lastU = row.unweightedAmounts[this.dates[this.dates.length - 1]] ?? 0;
          row.unweightedVariancePct = firstU !== 0 ? ((lastU - firstU) / Math.abs(firstU)) * 100 : 0;
        }
        row.expandable = false;
        row.expanded = false;

        // Remove all descendants
        const descendants = this.collectDescendants(row, rows);
        for (const desc of descendants) {
          const idx = rows.indexOf(desc);
          if (idx !== -1) rows.splice(idx, 1);
        }
        changed = true;
        break; // restart since array mutated
      }
    }
  }

  private collectLeaves(parent: LcrMetricTreeRow, rows: LcrMetricTreeRow[]): LcrMetricTreeRow[] {
    const result: LcrMetricTreeRow[] = [];
    const children = rows.filter(r => r.parentCode === parent.code && r.level === parent.level + 1);
    for (const child of children) {
      if (!child.expandable) {
        result.push(child);
      } else {
        result.push(...this.collectLeaves(child, rows));
      }
    }
    return result;
  }

  private collectDescendants(parent: LcrMetricTreeRow, rows: LcrMetricTreeRow[]): LcrMetricTreeRow[] {
    const result: LcrMetricTreeRow[] = [];
    const children = rows.filter(r => r.parentCode === parent.code && r.level === parent.level + 1);
    for (const child of children) {
      result.push(child);
      result.push(...this.collectDescendants(child, rows));
    }
    return result;
  }

  private orderTreeRows(rows: LcrMetricTreeRow[]): LcrMetricTreeRow[] {
    const result: LcrMetricTreeRow[] = [];
    const roots = rows.filter(r => r.level === 1);
    const addWithChildren = (parent: LcrMetricTreeRow): void => {
      result.push(parent);
      const children = rows.filter(r => r.parentCode === parent.code && r.level === parent.level + 1);
      for (const child of children) {
        addWithChildren(child);
      }
    };
    for (const root of roots) {
      addWithChildren(root);
    }
    return result;
  }

  private mergeItems(data: OsfiLcrMetricReportItem[]): OsfiLcrMetricReportItem[] {
    const mergeMap = new Map<string, OsfiLcrMetricReportItem>();

    for (const item of data) {
      const key = [
        item.v_report_line_name,
        ...extractLevels(item).map(l => l.v_level_code)
      ].join('|');

      if (!mergeMap.has(key)) {
        mergeMap.set(key, JSON.parse(JSON.stringify(item)));
      } else {
        const existing = mergeMap.get(key)!;
        for (let si = 0; si < existing.segment_data.length; si++) {
          const existSeg = existing.segment_data[si];
          const newSeg = item.segment_data[si];
          if (!newSeg) continue;
          for (let di = 0; di < existSeg.date_data.length; di++) {
            const existDate = existSeg.date_data[di];
            const newDate = newSeg.date_data[di];
            if (!newDate) continue;
            existDate.n_amount_rpt_ccy += newDate.n_amount_rpt_ccy;
            existDate.n_rw_amount_rpt_ccy += newDate.n_rw_amount_rpt_ccy;
          }
        }
      }
    }

    return Array.from(mergeMap.values());
  }

  private aggregateMetricAmounts(parent: LcrMetricTreeRow, children: LcrMetricTreeRow[]): void {
    for (const date of this.dates) {
      let sumW = 0, sumU = 0;
      for (const child of children) {
        sumW += child.weightedAmounts[date] ?? 0;
        sumU += child.unweightedAmounts[date] ?? 0;
      }
      parent.weightedAmounts[date] = sumW;
      parent.unweightedAmounts[date] = sumU;
    }
    if (this.dates.length >= 2) {
      const firstW = parent.weightedAmounts[this.dates[0]] ?? 0;
      const lastW = parent.weightedAmounts[this.dates[this.dates.length - 1]] ?? 0;
      parent.weightedVariancePct = firstW !== 0 ? ((lastW - firstW) / Math.abs(firstW)) * 100 : 0;
      const firstU = parent.unweightedAmounts[this.dates[0]] ?? 0;
      const lastU = parent.unweightedAmounts[this.dates[this.dates.length - 1]] ?? 0;
      parent.unweightedVariancePct = firstU !== 0 ? ((lastU - firstU) / Math.abs(firstU)) * 100 : 0;
    }
  }
}
