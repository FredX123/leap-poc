export interface UserInfo {
  displayName: string | null;
  email: string | null;
  roles: string[];
  groups: string[];
  authenticated: boolean;
  /**
   * Indicates the current user session was created via mock login (not Entra ID).
   * It's true only when the user is authenticated through MockAuthController. Used to:
   *  - Show the "Mock" badge next to the user name
   *  - Route logout to POST /api/mock/logout instead of Spring's OIDC logout
   */
  mock?: boolean;
  /**
   * Indicates the server is running with the mock Spring profile active.
   * It's true regardless of whether a user is logged in or not. Used to:
   *  - Show the mock user dropdown (instead of the "Log in" button) in the header
   *  - Hide Entra-specific UI when Entra ID is not configured
   */
  mockProfile?: boolean;
}

export interface MockUserOption {
  username: string;
  displayName: string;
  description: string;
}
