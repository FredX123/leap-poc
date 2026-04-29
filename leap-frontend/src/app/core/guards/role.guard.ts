import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory that creates a route guard requiring any of the given groups.
 * Usage in routes: canActivate: [groupGuard('GRP_READ', 'GRP_WRITE')]
 */
export function groupGuard(...requiredGroups: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      auth.login();
      return false;
    }

    if (auth.hasAnyGroup(...requiredGroups)) {
      return true;
    }

    // Logged in but lacks required group → redirect to access-denied page
    return router.createUrlTree(['/access-denied']);
  };
}
