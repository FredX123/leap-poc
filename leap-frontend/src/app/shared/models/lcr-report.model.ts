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

export interface LcrMetricRequest {
  segment: string;
  startDate: string;
  endDate: string;
}

// --- OSFI LCR Report types ---

export interface OsfiLcrDependency {
  recordId: string;
  value: number;
}

export interface OsfiLcrCalculatedData {
  recordId: string;
  calculatedValue: number;
  type: string;
  formula: string;
  weight?: number;
  dependencies: OsfiLcrDependency[];
  displayValue: number;
}

export interface OsfiLcrReferenceData {
  reporting_row: number;
  product_class_result: string;
  reporting_type_amount: string;
  calc_id: number;
  original_currency: string;
  original_amount: number;
  reporting_currency: string;
  reporting_amount: number;
  reportable_currency: string;
  rowNo: number;
}

export interface OsfiLcrReportDto {
  calculatedData: OsfiLcrCalculatedData[];
  referenceData: OsfiLcrReferenceData[];
  adjustments: OsfiLcrAdjustmentDto[];
}

export interface OsfiLcrReportLine {
  lineCode: string;
  lineName: string;
  lineType: 'section' | 'subsection' | 'subheader' | 'data';
  displayOrder: number;
  weight: number | null;
  weightedLineCode: string | null;
}

export interface OsfiLcrRequest {
  calcId: number;
  reportingDate: string;
  currency: string;
}

/** Available currencies for the LCR report */
export const LCR_CURRENCIES = ['ALL', 'CAD', 'USD', 'JPY', 'EUR', 'GBP', 'OTH', 'ADJ'] as const;

/** Adjustment request sent to the backend */
export interface OsfiLcrAdjustmentRequest {
  calcId: number;
  lineCode: string;
  currency: string;
  adjustmentValue: number;
  comment: string;
}

/** Adjustment loaded from the backend */
export interface OsfiLcrAdjustmentDto {
  id: number;
  calcId: number;
  lineCode: string;
  currency: string;
  adjustmentValue: number;
  comment: string;
}

// --- Tree node types for rendering ---

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
