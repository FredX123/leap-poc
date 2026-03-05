import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
