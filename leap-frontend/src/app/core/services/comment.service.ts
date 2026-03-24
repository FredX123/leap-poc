import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentDto, CommentThreadDto, CreateCommentRequest } from '../../shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private readonly baseUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getThread(entityType: string, entityId: number): Observable<CommentThreadDto[]> {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId);
    return this.http.get<CommentThreadDto[]>(this.baseUrl, { params });
  }

  create(request: CreateCommentRequest): Observable<CommentDto> {
    return this.http.post<CommentDto>(this.baseUrl, request);
  }

  update(id: number, content: string): Observable<CommentDto> {
    return this.http.put<CommentDto>(`${this.baseUrl}/${id}`, { content });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCounts(entityType: string, entityIds: number[]): Observable<Record<string, number>> {
    let params = new HttpParams().set('entityType', entityType);
    for (const id of entityIds) {
      params = params.append('entityIds', id);
    }
    return this.http.get<Record<string, number>>(`${this.baseUrl}/counts`, { params });
  }
}
