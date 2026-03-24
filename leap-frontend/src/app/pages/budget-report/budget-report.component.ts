import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { BudgetService } from '../../core/services/budget.service';
import { CommentService } from '../../core/services/comment.service';
import { BudgetRow } from '../../shared/models/budget-row.model';
import { CommentThreadPanelComponent } from '../../shared/components/comment-thread-panel/comment-thread-panel.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-budget-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CommentThreadPanelComponent],
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

  // Comment panel state
  commentPanelOpen = false;
  commentEntityType = 'BUDGET_REPORT';
  commentEntityId = 0;
  commentCounts: Record<number, number> = {};

  private destroyRef = inject(DestroyRef);

  constructor(
    private cd: ChangeDetectorRef,
    public auth: AuthService,
    private budgetService: BudgetService,
    private commentService: CommentService
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
        this.loadCommentCounts();
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

  // --- Comment panel ---

  openComments(row: BudgetRow): void {
    this.commentEntityId = row.id;
    this.commentPanelOpen = true;
  }

  closeComments(): void {
    this.commentPanelOpen = false;
  }

  onCommentCountChanged(count: number): void {
    this.commentCounts[this.commentEntityId] = count;
    this.cd.markForCheck();
  }

  /** 6.6: Batch-load comment counts for all budget rows */
  private loadCommentCounts(): void {
    if (!this.rows.length) return;
    const ids = this.rows.map(r => r.id);
    this.commentService.getCounts(this.commentEntityType, ids).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: counts => {
        // counts is { "1": 3, "2": 0, ... } — keys are strings from JSON
        this.commentCounts = {};
        for (const [key, value] of Object.entries(counts)) {
          this.commentCounts[+key] = value;
        }
        this.cd.markForCheck();
      }
    });
  }

  private showMessage(text: string, type: 'success' | 'danger'): void {
    this.message = { text, type };
    setTimeout(() => this.message = null, 4000);
  }
}
