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

export interface OsfiLcrReportItem {
  v_report_code: string;
  v_para_code: string;
  v_report_line_level_code_01: string;
  v_report_line_level_desc_01: string;
  v_report_line_level_code_02: string;
  v_report_line_level_desc_02: string;
  v_report_line_code: string;
  v_report_line_name: string;
  segment_data: OsfiLcrSegmentData[];
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
  v_report_line_level_code_01: string;
  v_report_line_level_desc_01: string;
  v_report_line_level_code_02: string;
  v_report_line_level_desc_02: string;
  v_report_line_code: string;
  v_report_line_name: string;
  segment_data: OsfiLcrMetricSegmentData[];
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
