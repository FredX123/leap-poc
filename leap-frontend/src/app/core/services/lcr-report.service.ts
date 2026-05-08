import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
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
}
