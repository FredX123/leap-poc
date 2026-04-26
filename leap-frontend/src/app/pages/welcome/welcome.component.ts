import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class WelcomeComponent {
  
  apiUrls: Record<string, string> = {
    'APP_ADMIN': '/api/report/admin-only',
    'APP_WRITE': '/api/report/write-only',
    'APP_READ': '/api/report/read-only'
  };

  message: { text: string; type: 'success' | 'danger' } | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    public auth: AuthService,
    private http: HttpClient
  ) {}


  testAuth(role: string): void {
    const url = this.apiUrls[role];

    this.http.get(url, { responseType: 'text' }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.showMessage(`Successfully accessed ${url} as ${role}.`, 'success'),
      error: (err: HttpErrorResponse) => {
        const msg = err.status === 401
          ? 'Please log in first...' 
          : err.status === 403 ? 'Access denied...' : 'Failed to save changes.';
        this.showMessage(msg, 'danger');
        this.cd.markForCheck();
      }
    });
  }

  private showMessage(text: string, type: 'success' | 'danger'): void {
    this.message = { text, type };
    this.cd.markForCheck();
    setTimeout(() => {
      this.message = null;
      this.cd.markForCheck();
    }, 4000);
  }

}
