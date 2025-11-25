export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  department?: string;
  hierarchy_level?: number;
  is_active?: boolean;
  last_login?: string;
  permissions: Record<string, boolean>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'CEO' | 'Co-Founder' | 'Sales Agent';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
}
