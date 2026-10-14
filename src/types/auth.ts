export type UserRole = 'ADMIN' | 'DRIVER' | 'SIMULATION_OPERATOR';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  operatorId: string;
  role: UserRole;
  avatar?: string;
  assignedVehicle?: string; // e.g. NER-TRK-01 for DRIVER
  designation?: string;
  token: string;
}

export interface LoginCredentials {
  identifier: string; // Email or Operator ID
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthenticatedUser>;
  logout: () => void;
  clearError: () => void;
}
