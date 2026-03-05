import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-lg-8 text-center">
          <h1 class="display-4 fw-bold mb-3">
            <i class="bi bi-shield-lock text-primary me-2"></i>LEAP POC
          </h1>
          <p class="lead text-muted mb-4">
            Secure BFF Pattern — Spring Boot + Angular + Microsoft Entra ID
          </p>
          <hr class="my-4">

          <!-- Not logged in -->
          <div *ngIf="!auth.isAuthenticated">
            <p class="mb-4">
              This proof-of-concept demonstrates single sign-on via Microsoft Entra ID
              with MFA, role-based access control, and the Backend-for-Frontend (BFF) session
              pattern — zero tokens stored in the browser.
            </p>
            <button class="btn btn-primary btn-lg" (click)="auth.login()">
              <i class="bi bi-box-arrow-in-right me-2"></i>Sign in with Microsoft
            </button>
          </div>

          <!-- Logged in -->
          <div *ngIf="auth.isAuthenticated">
            <div class="alert alert-success text-start" role="alert">
              <h5 class="alert-heading">
                <i class="bi bi-check-circle me-1"></i>
                Welcome, {{ auth.user?.displayName || auth.user?.email }}!
              </h5>
              <p class="mb-1">You are authenticated. Your assigned roles:</p>
              <ul class="mb-0">
                <li *ngFor="let role of auth.user?.roles">{{ role }}</li>
              </ul>
            </div>
            <p class="text-muted">Use the navigation bar above to access your authorized pages.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WelcomeComponent {
  constructor(public auth: AuthService) {}
}
