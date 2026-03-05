import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Factory that creates a route guard requiring any of the given roles.
 * Usage in routes: canActivate: [roleGuard('APP_READ', 'APP_WRITE')]
 */
export function roleGuard(...requiredRoles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      auth.login();
      return false;
    }

    if (auth.hasAnyRole(...requiredRoles)) {
      return true;
    }

    // Logged in but lacks required role → redirect to access-denied page
    return router.createUrlTree(['/access-denied']);
  };
}
