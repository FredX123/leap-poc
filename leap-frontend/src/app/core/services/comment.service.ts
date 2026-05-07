import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDto, CommentThreadDto, CreateCommentRequest } from '../../shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private readonly baseUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getThread(reportType: string, lineKey: string, segmentName: string | null): Observable<CommentThreadDto[]> {
    let params = new HttpParams()
      .set('reportType', reportType)
      .set('lineKey', lineKey);
    if (segmentName) {
      params = params.set('segmentName', segmentName);
    }
    return this.http.get<CommentThreadDto[]>(this.baseUrl, { params });
  }

  getHierarchyThreads(reportType: string, segmentName: string, lineKey: string): Observable<Record<string, CommentThreadDto[]>> {
    const params = new HttpParams()
      .set('reportType', reportType)
      .set('segmentName', segmentName)
      .set('lineKey', lineKey);
    return this.http.get<Record<string, CommentThreadDto[]>>(`${this.baseUrl}/hierarchy`, { params });
  }

  create(request: CreateCommentRequest): Observable<CommentDto> {
    return this.http.post<CommentDto>(this.baseUrl, request);
  }

  update(id: number, content: string, driverCode?: string): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.baseUrl}/${id}`, { content, driverCode });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCounts(reportType: string, segmentName: string | null): Observable<Record<string, number>> {
    let params = new HttpParams().set('reportType', reportType);
    if (segmentName) {
      params = params.set('segmentName', segmentName);
    }
    return this.http.get<Record<string, number>>(`${this.baseUrl}/counts`, { params });
  }
}
