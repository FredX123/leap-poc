import { Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EntraUserService } from '../../core/services/entra-user.service';

/**
 * Shows "lastName, firstName" as a native tooltip when hovering over the host element.
 * Fetches user data lazily on first mouseenter, then caches.
 *
 * Usage:  <strong [appAuthorTooltip]="comment.userId">{{ comment.displayName }}</strong>
 */
@Directive({
  selector: '[appAuthorTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()'
  }
})
export class AuthorTooltipDirective implements OnDestroy {
  @Input('appAuthorTooltip') userId: string | null = null;

  private fetched = false;
  private sub: Subscription | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private entraUserService: EntraUserService
  ) {}

  onMouseEnter(): void {
    if (this.fetched || !this.userId) return;
    this.fetched = true;

    this.sub = this.entraUserService.getUser(this.userId).subscribe(user => {
      if (user?.lastName || user?.firstName) {
        const parts = [user.lastName, user.firstName].filter(Boolean);
        this.el.nativeElement.title = parts.join(', ');
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
