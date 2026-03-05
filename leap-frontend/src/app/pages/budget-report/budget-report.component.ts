import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { BudgetRow } from '../../shared/models/budget-row.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-budget-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-report.component.html',
  styleUrl: './budget-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetReportComponent implements OnInit {

  rows: BudgetRow[] = [];
  editingId: number | null = null;
  editExpenses: number = 0;
  editBudget: number = 0;
  message: { text: string; type: 'success' | 'danger' } | null = null;
  loading = false;

  canWrite = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    public auth: AuthService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.canWrite = this.auth.hasRole('APP_WRITE');
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.budgetService.getAll().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: data => {
        this.rows = data; this.loading = false;
        this.cd.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.status === 403
          ? 'You are not allowed to load budget data.'
          : 'Failed to load budget data.';
        this.showMessage(msg, 'danger');
        this.loading = false;
        this.cd.markForCheck();
      }
    });
  }

  startEdit(row: BudgetRow): void {
    this.editingId = row.id;
    this.editExpenses = row.monthlyExpenses;
    this.editBudget = row.monthlyBudget;
    this.message = null;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(row: BudgetRow): void {
    this.budgetService.update(row.id, {
      monthlyExpenses: this.editExpenses,
      monthlyBudget: this.editBudget
    }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        const idx = this.rows.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.rows[idx] = updated;
        this.editingId = null;
        this.showMessage(`"${updated.itemDescription}" updated successfully.`, 'success');
        this.cd.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.status === 403
          ? 'You are not allowed to change budget data.'
          : 'Failed to save changes.';
        this.showMessage(msg, 'danger');
        this.cd.markForCheck();
      }
    });
  }

  /** Returns a Bootstrap class based on usage percentage. */
  performanceBadge(row: BudgetRow): string {
    if (row.budgetUsagePercent <= 75) return 'bg-success';
    if (row.budgetUsagePercent <= 100) return 'bg-warning text-dark';
    return 'bg-danger';
  }

  private showMessage(text: string, type: 'success' | 'danger'): void {
    this.message = { text, type };
    setTimeout(() => this.message = null, 4000);
  }
}
