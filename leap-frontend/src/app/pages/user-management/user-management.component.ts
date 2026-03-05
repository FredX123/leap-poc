import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <h2><i class="bi bi-people me-2"></i>User Management</h2>
      <hr>
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-1"></i>
        This page is only visible to users with the <strong>APP_ADMIN</strong> role.
        <br>
        Full user management functionality can be implemented here in a future iteration.
      </div>
      <div class="card">
        <div class="card-body">
          <p class="card-text text-muted">
            Placeholder for admin-only user management features: view users, assign roles, etc.
          </p>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent {}
