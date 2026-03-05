import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent { }
