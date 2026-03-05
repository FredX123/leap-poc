import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../core/services/budget.service';
import { HttpErrorResponse } from '@angular/common/http';
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
    'APP_ADMIN': '/api/budget/admin-only',
    'APP_WRITE': '/api/budget/write-only',
    'APP_READ': '/api/budget/read-only'
  };

  message: { text: string; type: 'success' | 'danger' } | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    public auth: AuthService,
    private budgetService: BudgetService
  ) {}


  testAuth(role: string): void {
    const url = this.apiUrls[role];

    this.budgetService.testEndpoint(url).pipe(
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
    setTimeout(() => {
      this.message = null;
      this.cd.markForCheck();
    }, 4000);
  }

}
