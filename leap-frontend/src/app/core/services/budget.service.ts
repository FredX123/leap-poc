import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BudgetRow } from '../../shared/models/budget-row.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {

  private readonly baseUrl = '/api/budget';

  constructor(private http: HttpClient) {}

  getAll(): Observable<BudgetRow[]> {
    return this.http.get<BudgetRow[]>(this.baseUrl);
  }

  update(id: number, data: Partial<BudgetRow>): Observable<BudgetRow> {
    return this.http.put<BudgetRow>(`${this.baseUrl}/${id}`, data);
  }

  testEndpoint(url: string): Observable<void> {
    return this.http.get<void>(url);
  }
}
