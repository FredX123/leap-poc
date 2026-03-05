export interface UserInfo {
  displayName: string | null;
  email: string | null;
  roles: string[];
  authenticated: boolean;
}
