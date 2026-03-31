import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MockUserOption } from '../../shared/models/user-info.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  mockUsers: MockUserOption[] = [];

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    // If already in mock profile, eagerly load mock users
    if (this.auth.isMockProfile) {
      this.loadMockUsers();
    }
  }

  private loadMockUsers(): void {
    if (this.mockUsers.length > 0) return;
    this.auth.getMockUsers().subscribe(users => {
      this.mockUsers = users;
      this.cdr.markForCheck();
    });
  }

  mockLogin(username: string): void {
    if (!username) return;
    this.auth.mockLogin(username).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  onLogout(): void {
    if (this.auth.isMock) {
      this.auth.mockLogout().subscribe(() => {
        this.loadMockUsers();
        this.router.navigate(['/']);
        this.cdr.markForCheck();
      });
    } else {
      this.auth.logout();
    }
  }
}
