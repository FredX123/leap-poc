import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-lg-6 text-center">
          <div class="text-danger mb-3">
            <i class="bi bi-shield-exclamation" style="font-size: 4rem;"></i>
          </div>
          <h2 class="fw-bold">Access Denied</h2>
          <p class="text-muted mt-3">
            You do not have the required permissions to view this page.
            Please contact your administrator if you believe this is an error.
          </p>
          <a routerLink="/" class="btn btn-primary mt-3">
            <i class="bi bi-house me-1"></i>Back to Home
          </a>
        </div>
      </div>
    </div>
  `
})
export class AccessDeniedComponent {}
