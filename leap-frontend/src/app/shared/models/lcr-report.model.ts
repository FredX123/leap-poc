export interface OsfiLcrDateData {
  n_date_skey: number;
  d_calander_date: string;
  n_amount_rpt_ccy: number;
}

export interface OsfiLcrSegmentData {
  n_segment_order: number;
  v_segment_name: string;
  date_data: OsfiLcrDateData[];
}

export interface ReportLineLevel {
  v_level_code: string;
  v_level_desc: string;
}

/**
 * Extracts dynamic level fields (v_report_line_level_code_01, _02, …)
 * from a flat JSON item into an ordered array.
 */
export function extractLevels(item: { [key: string]: any }): ReportLineLevel[] {
  const levels: ReportLineLevel[] = [];
  for (let i = 1; ; i++) {
    const suffix = String(i).padStart(2, '0');
    const code = item[`v_report_line_level_code_${suffix}`];
    if (!code) break;
    const desc = item[`v_report_line_level_desc_${suffix}`] || '';
    levels.push({ v_level_code: code, v_level_desc: desc });
  }
  return levels;
}

export interface OsfiLcrReportItem {
  v_report_code: string;
  v_para_code?: string;
  v_report_line_code: string;
  v_report_line_name: string;
  segment_data: OsfiLcrSegmentData[];
  [key: string]: any;
}

export interface OsfiLcrMetricDateData {
  n_date_skey: number;
  d_calander_date: string;
  n_amount_rpt_ccy: number;
  n_rw_amount_rpt_ccy: number;
}

export interface OsfiLcrMetricSegmentData {
  n_segment_order: number;
  v_segment_name: string;
  date_data: OsfiLcrMetricDateData[];
}

export interface OsfiLcrMetricReportItem {
  v_report_code: string;
  v_para_code: string;
  v_report_line_code: string;
  v_report_line_name: string;
  segment_data: OsfiLcrMetricSegmentData[];
  [key: string]: any;
}

export interface LcrDateRequest {
  startDate: string;
  endDate: string;
}

export interface LcrMetricRequest {
  segment: string;
  startDate: string;
  endDate: string;
}

// --- Tree node types for rendering ---

export interface LcrSegmentHeader {
  segmentName: string;
  segmentOrder: number;
}

export interface LcrTreeRow {
  level: number;
  name: string;
  code: string;
  expanded: boolean;
  expandable: boolean;
  parentCode: string | null;
  grandparentCode: string | null;
  /** Per-segment, per-date amounts: segmentKey -> dateStr -> amount */
  amounts: Record<string, Record<string, number>>;
  /** Per-segment variance %: segmentKey -> pct */
  variancePct: Record<string, number>;
}

export interface LcrMetricTreeRow {
  level: number;
  name: string;
  code: string;
  expanded: boolean;
  expandable: boolean;
  parentCode: string | null;
  grandparentCode: string | null;
  /** weighted amounts per date: dateStr -> amount */
  weightedAmounts: Record<string, number>;
  weightedVariancePct: number;
  /** unweighted amounts per date: dateStr -> amount */
  unweightedAmounts: Record<string, number>;
  unweightedVariancePct: number;
}
