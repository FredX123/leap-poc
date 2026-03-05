import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { csrfInterceptor } from './core/interceptors/csrf.interceptor';

/** Load user info from backend session before the app renders. */
function initAuth(auth: AuthService) {
  return () => firstValueFrom(auth.loadUser());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([csrfInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
