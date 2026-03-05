export interface BudgetRow {
  id: number;
  itemDescription: string;
  monthlyExpenses: number;
  monthlyBudget: number;
  budgetVariance: number;
  budgetUsagePercent: number;
}
