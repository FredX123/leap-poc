import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface EntraUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  userPrincipalName: string | null;
  mail: string | null;
}

@Injectable({ providedIn: 'root' })
export class EntraUserService {

  private cache = new Map<string, Observable<EntraUser | null>>();

  constructor(private http: HttpClient) {}

  /**
   * Look up an Entra ID user by userId (object-ID, UPN, or email).
   * Results are cached per userId for the lifetime of the service.
   */
  getUser(userId: string): Observable<EntraUser | null> {
    const cached = this.cache.get(userId);
    if (cached) return cached;

    const req$ = this.http.get<EntraUser>(`/api/entra-users/${encodeURIComponent(userId)}`).pipe(
      catchError(() => of(null)),
      shareReplay(1)
    );
    this.cache.set(userId, req$);
    return req$;
  }
}
