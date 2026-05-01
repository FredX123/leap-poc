import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LcrCalcReportDto,
  LcrCalcReportRequest,
  LcrCalcAdjustmentRequest
} from '../../shared/models/lcr-calc-report.model';

@Injectable({ providedIn: 'root' })
export class LcrCalcReportService {

  private readonly baseUrl = '/api/report/lcr-calc';

  constructor(private http: HttpClient) {}

  getReport(request: LcrCalcReportRequest): Observable<LcrCalcReportDto> {
    return this.http.post<LcrCalcReportDto>(this.baseUrl, request);
  }

  saveAdjustment(request: LcrCalcAdjustmentRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/adjustment`, request);
  }

  deleteAdjustment(calcId: number, lineId: number, currency: string): Observable<void> {
    const params = new HttpParams()
      .set('calcId', calcId.toString())
      .set('lineId', lineId.toString())
      .set('currency', currency);
    return this.http.delete<void>(`${this.baseUrl}/adjustment`, { params });
  }
}
