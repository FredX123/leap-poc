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
    path: 'admin-only',
    component: WelcomeComponent,
    canActivate: [roleGuard('APP_ADMIN')]
  },
  {
    path: 'write-only',
    component: WelcomeComponent,
    canActivate: [roleGuard('APP_WRITE')]
  },
  {
    path: 'read-only',
    component: WelcomeComponent,
    canActivate: [roleGuard('APP_READ')]
  },
  {
    path: 'osfi-lcr-report',
    loadComponent: () =>
      import('./pages/osfi-lcr-report/osfi-lcr-report.component').then(m => m.OsfiLcrReportComponent),
    canActivate: [roleGuard('APP_READ', 'APP_WRITE')]
  },
  {
    path: 'osfi-lcr-metric-report',
    loadComponent: () =>
      import('./pages/osfi-lcr-metric-report/osfi-lcr-metric-report.component').then(m => m.OsfiLcrMetricReportComponent),
    canActivate: [roleGuard('APP_READ', 'APP_WRITE')]
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./pages/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  { path: '**', redirectTo: '' }
];
