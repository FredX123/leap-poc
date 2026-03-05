import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <a class="navbar-brand" routerLink="/">
        <i class="bi bi-rocket-takeoff me-2"></i>LEAP POC
      </a>

      <!-- Role-based menus (only when authenticated) -->
      <div class="collapse navbar-collapse" *ngIf="auth.isAuthenticated">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" *ngIf="auth.hasRole('APP_ADMIN')">
            <a class="nav-link" routerLink="/user-management" routerLinkActive="active">
              <i class="bi bi-people me-1"></i>User Management
            </a>
          </li>
          <li class="nav-item" *ngIf="auth.hasAnyRole('APP_READ', 'APP_WRITE')">
            <a class="nav-link" routerLink="/budget-report" routerLinkActive="active">
              <i class="bi bi-bar-chart-line me-1"></i>Budget Report
            </a>
          </li>
        </ul>
      </div>

      <!-- Right-aligned login / logout -->
      <div class="d-flex align-items-center ms-auto">
        <span class="text-light me-3" *ngIf="auth.isAuthenticated">
          {{ auth.user?.displayName || auth.user?.email }}
        </span>
        <button class="btn btn-outline-light btn-sm"
                *ngIf="!auth.isAuthenticated"
                (click)="auth.login()">
          <i class="bi bi-box-arrow-in-right me-1"></i>Log in
        </button>
        <button class="btn btn-outline-warning btn-sm"
                *ngIf="auth.isAuthenticated"
                (click)="auth.logout()">
          <i class="bi bi-box-arrow-right me-1"></i>Log out
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand { font-weight: 600; letter-spacing: 1px; }
  `]
})
export class HeaderComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // user is loaded by APP_INITIALIZER, nothing else needed
  }
}
