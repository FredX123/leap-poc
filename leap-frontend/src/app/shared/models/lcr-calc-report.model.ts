export interface LcrCalcLineDto {
  id: number;
  lineCode: string | null;
  lineName: string;
  sectionCode: string | null;
  sectionName: string | null;
  subsectionCode: string | null;
  subsectionName: string | null;
  weight: number | null;
  weightedLineCode: string | null;
  lineType: 'section' | 'subsection' | 'subheader' | 'data';
  displayOrder: number;
  marketValue: number | null;
  weightedAmount: number | null;
  adjustmentValue: number | null;
  adjustmentComment: string | null;
}

export interface LcrCalcReportDto {
  calcId: number;
  reportingDate: string;
  currency: string;
  availableCurrencies: string[];
  lines: LcrCalcLineDto[];
}

export interface LcrCalcReportRequest {
  calcId: number;
  reportingDate: string;
  currency: string;
}

export interface LcrCalcAdjustmentRequest {
  calcId: number;
  lineId: number;
  currency: string;
  adjustmentValue: number;
  comment: string;
}
