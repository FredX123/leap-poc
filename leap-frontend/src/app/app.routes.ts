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
  { path: '**', redirectTo: '' }
];
