import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { BudgetRow } from '../../shared/models/budget-row.model';

@Component({
  selector: 'app-budget-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-report.component.html',
  styleUrl: './budget-report.component.scss'
})
export class BudgetReportComponent implements OnInit {

  rows: BudgetRow[] = [];
  editingId: number | null = null;
  editExpenses: number = 0;
  editBudget: number = 0;
  message: { text: string; type: 'success' | 'danger' } | null = null;
  loading = false;

  canWrite = false;

  constructor(
    public auth: AuthService,
    private budgetService: BudgetService
  ) {}

  ngOnInit(): void {
    this.canWrite = this.auth.hasRole('APP_WRITE');
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.budgetService.getAll().subscribe({
      next: data => { this.rows = data; this.loading = false; },
      error: () => { this.showMessage('Failed to load budget data.', 'danger'); this.loading = false; }
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
    }).subscribe({
      next: updated => {
        const idx = this.rows.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.rows[idx] = updated;
        this.editingId = null;
        this.showMessage(`"${updated.itemDescription}" updated successfully.`, 'success');
      },
      error: () => {
        this.showMessage('Failed to save changes.', 'danger');
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
