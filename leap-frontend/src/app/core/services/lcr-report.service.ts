import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OsfiLcrAdjustmentRequest,
  OsfiLcrAdjustmentDto,
  LcrMetricRequest,
  OsfiLcrMetricReportItem,
  OsfiLcrReportDto,
  OsfiLcrRequest
} from '../../shared/models/lcr-report.model';

@Injectable({ providedIn: 'root' })
export class LcrReportService {

  private readonly baseUrl = '/api/report';

  constructor(private http: HttpClient) {}

  getOsfiLcrReport(request: OsfiLcrRequest): Observable<OsfiLcrReportDto> {
    return this.http.post<OsfiLcrReportDto>(`${this.baseUrl}/osfi-lcr`, request);
  }

  getOsfiLcrMetricReport(request: LcrMetricRequest): Observable<OsfiLcrMetricReportItem[]> {
    return this.http.post<OsfiLcrMetricReportItem[]>(`${this.baseUrl}/osfi-lcr-metric`, request);
  }

  getAdjustment(calcId: number, lineId: number, currency: string): Observable<OsfiLcrAdjustmentDto> {
    const params = new HttpParams()
      .set('calcId', calcId)
      .set('lineId', lineId)
      .set('currency', currency);
    return this.http.get<OsfiLcrAdjustmentDto>(`${this.baseUrl}/osfi-lcr/adjustment`, { params });
  }

  saveAdjustment(request: OsfiLcrAdjustmentRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/osfi-lcr/adjustment`, request);
  }

  deleteAdjustment(calcId: number, lineId: number, currency: string): Observable<void> {
    const params = new HttpParams()
      .set('calcId', calcId)
      .set('lineId', lineId)
      .set('currency', currency);
    return this.http.delete<void>(`${this.baseUrl}/osfi-lcr/adjustment`, { params });
  }
}
