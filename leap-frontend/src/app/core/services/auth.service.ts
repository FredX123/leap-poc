import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of, switchMap } from 'rxjs';
import { UserInfo, MockUserOption } from '../../shared/models/user-info.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userSubject = new BehaviorSubject<UserInfo | null>(null);

  /** Observable of current user info; null until loaded. */
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Call once on app init to hydrate user state from session cookie. */
  loadUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>('/api/me').pipe(
      tap(user => this.userSubject.next(user)),
      catchError(() => {
        const anon: UserInfo = { displayName: null, email: null, roles: [], groups: [], authenticated: false };
        this.userSubject.next(anon);
        return of(anon);
      })
    );
  }

  get user(): UserInfo | null {
    return this.userSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.userSubject.value?.authenticated === true;
  }

  get isMock(): boolean {
    return this.userSubject.value?.mock === true;
  }

  hasRole(role: string): boolean {
    return this.userSubject.value?.roles?.includes(role) ?? false;
  }

  hasAnyRole(...roles: string[]): boolean {
    return roles.some(r => this.hasRole(r));
  }

  hasGroup(group: string): boolean {
    return this.userSubject.value?.groups?.includes(group) ?? false;
  }

  hasAnyGroup(...groups: string[]): boolean {
    return groups.some(g => this.hasGroup(g));
  }

  /**
   * Check if the user has any of the given roles OR any of the corresponding groups.
   * Maps: APP_ADMIN ↔ GRP_ADMIN, APP_WRITE ↔ GRP_WRITE, APP_READ ↔ GRP_READ
   */
  hasAnyRoleOrGroup(...roles: string[]): boolean {
    if (this.hasAnyRole(...roles)) return true;
    const groupMap: Record<string, string> = {
      'APP_ADMIN': 'GRP_ADMIN',
      'APP_WRITE': 'GRP_WRITE',
      'APP_READ': 'GRP_READ'
    };
    const groups = roles.map(r => groupMap[r]).filter(Boolean);
    return groups.length > 0 && this.hasAnyGroup(...groups);
  }

  /** Navigate to Spring Security login endpoint (full-page redirect). */
  login(): void {
    window.location.href = '/oauth2/authorization/entra';
  }

  /** POST to backend logout; Spring invalidates session and redirects back. */
  logout(): void {
    // Build a hidden form to POST /api/logout (includes CSRF token via cookie).
    // This is the cleanest approach because Spring's logout filter expects POST
    // and the response is a 302 redirect — which AJAX can't follow for navigation.
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/logout';

    // Include CSRF token
    const csrfToken = this.getCookie('XSRF-TOKEN');
    if (csrfToken) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_csrf';
      input.value = csrfToken;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  /** Fetch the list of available mock users from the backend. */
  getMockUsers(): Observable<MockUserOption[]> {
    return this.http.get<MockUserOption[]>('/api/mock/users');
  }

  /** Authenticate as a mock user (no Entra ID required). */
  mockLogin(username: string): Observable<UserInfo> {
    return this.http.post<UserInfo>('/api/mock/login', { username }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  /** Log out from a mock session and refresh user state. */
  mockLogout(): Observable<UserInfo> {
    return this.http.post('/api/mock/logout', {}).pipe(
      switchMap(() => this.loadUser())
    );
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
}
