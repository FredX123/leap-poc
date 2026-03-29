import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MockUserOption } from '../../shared/models/user-info.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  mockMode = false;
  mockUsers: MockUserOption[] = [];

  constructor(public auth: AuthService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    // user is loaded by APP_INITIALIZER, nothing else needed
  }

  onMockToggle(): void {
    if (this.mockMode && this.mockUsers.length === 0) {
      this.auth.getMockUsers().subscribe(users => {
        this.mockUsers = users;
        this.cdr.markForCheck();
      });
    }
  }

  mockLogin(username: string): void {
    if (!username) return;
    this.auth.mockLogin(username).subscribe(() => {
      this.mockMode = false;
      this.cdr.markForCheck();
    });
  }

  onLogout(): void {
    if (this.auth.isMock) {
      this.auth.mockLogout().subscribe(() => {
        this.router.navigate(['/']);
        this.cdr.markForCheck();
      });
    } else {
      this.auth.logout();
    }
  }
}
