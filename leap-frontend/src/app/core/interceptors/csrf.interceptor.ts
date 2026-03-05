import { HttpInterceptorFn } from '@angular/common/http';
import { HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Reads the XSRF-TOKEN cookie (set by Spring Security) and attaches
 * it as the X-XSRF-TOKEN header on mutating requests.
 *
 * Angular's built-in XSRF interceptor only works with HttpClientXsrfModule
 * and only for relative URLs. This custom interceptor ensures it works
 * for every request going through the proxy.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add CSRF header on mutating methods
  const isModifying = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());

  if (isModifying) {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      req = req.clone({
        setHeaders: { 'X-XSRF-TOKEN': token }
      });
    }
  }

  return next(req);
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
