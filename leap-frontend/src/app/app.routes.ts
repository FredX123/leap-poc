import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  {
    path: 'user-management',
    loadComponent: () =>
      import('./pages/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [roleGuard('APP_ADMIN')]
  },
  {
    path: 'budget-report',
    loadComponent: () =>
      import('./pages/budget-report/budget-report.component').then(m => m.BudgetReportComponent),
    canActivate: [roleGuard('APP_READ', 'APP_WRITE')]
  },
  {
    path: 'budget-report',
    loadComponent: () =>
      import('./pages/budget-report/budget-report.component').then(m => m.BudgetReportComponent),
    canActivate: [roleGuard('APP_READ', 'APP_WRITE')]
  },
  {
    path: 'admin-only',
    loadComponent: () =>
      import('./pages/budget-report/budget-report.component').then(m => m.BudgetReportComponent),
    canActivate: [roleGuard('APP_ADMIN')]
  },
  {
    path: 'write-only',
    loadComponent: () =>
      import('./pages/budget-report/budget-report.component').then(m => m.BudgetReportComponent),
    canActivate: [roleGuard('APP_WRITE')]
  },
  {
    path: 'read-only',
    loadComponent: () =>
      import('./pages/budget-report/budget-report.component').then(m => m.BudgetReportComponent),
    canActivate: [roleGuard('APP_READ')]
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  { path: '**', redirectTo: '' }
];
