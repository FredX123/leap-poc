export interface UserInfo {
  displayName: string | null;
  email: string | null;
  roles: string[];
  groups: string[];
  authenticated: boolean;
  mock?: boolean;
}

export interface MockUserOption {
  username: string;
  displayName: string;
  description: string;
}
