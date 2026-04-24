import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LcrDateRequest,
  LcrMetricRequest,
  OsfiLcrReportItem,
  OsfiLcrMetricReportItem
} from '../../shared/models/lcr-report.model';

@Injectable({ providedIn: 'root' })
export class LcrReportService {

  private readonly baseUrl = '/api/report';

  constructor(private http: HttpClient) {}

  getOsfiLcrReport(request: LcrDateRequest): Observable<OsfiLcrReportItem[]> {
    return this.http.post<OsfiLcrReportItem[]>(`${this.baseUrl}/osfi-lcr`, request);
  }

  getOsfiLcrMetricReport(request: LcrMetricRequest): Observable<OsfiLcrMetricReportItem[]> {
    return this.http.post<OsfiLcrMetricReportItem[]>(`${this.baseUrl}/osfi-lcr-metric`, request);
  }
}
