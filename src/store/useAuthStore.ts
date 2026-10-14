import { create } from 'zustand';
import { AuthenticatedUser, AuthState, LoginCredentials } from '../types/auth';

const STORAGE_KEY = 'nerlogix_auth_user';

// Mock credentials database for offline/instant fallback & validation
export const MOCK_USERS: Array<Omit<AuthenticatedUser, 'token'> & { passwords: string[] }> = [
  {
    id: 'USR-ADM-01',
    name: 'Major Vikram Sen',
    email: 'admin@nerlogix.in',
    operatorId: 'ADM-01',
    role: 'ADMIN',
    designation: 'Chief Logistics Controller',
    passwords: ['admin123', 'admin@123', 'password', '123456'],
  },
  {
    id: 'USR-DRV-01',
    name: 'Rohit Das',
    email: 'rohit@nerlogix.in',
    operatorId: 'DRV-01',
    role: 'DRIVER',
    assignedVehicle: 'NER-TRK-01',
    designation: 'Senior Heavy Freight Pilot',
    passwords: ['driver123', 'driver@123', 'password', '123456'],
  },
  {
    id: 'USR-SIM-01',
    name: 'Ananya Roy',
    email: 'sim@nerlogix.in',
    operatorId: 'SIM-01',
    role: 'SIMULATION_OPERATOR',
    designation: 'Tactical Disaster Simulator',
    passwords: ['sim123', 'sim@123', 'password', '123456'],
  },
];

export const useAuthStore = create<AuthState>((set, get) => {
  // Load initial user from localStorage if present
  let initialUser: AuthenticatedUser | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      initialUser = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse saved auth session:', e);
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
    error: null,

    login: async ({ identifier, password, rememberMe = true }: LoginCredentials): Promise<AuthenticatedUser> => {
      set({ isLoading: true, error: null });

      // Artificial short delay for realistic SaaS authentication
      await new Promise((resolve) => setTimeout(resolve, 600));

      const normalizedId = identifier.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Attempt to hit backend server if available, otherwise validate against secure local table
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          if (data.user) {
            const authUser: AuthenticatedUser = {
              ...data.user,
              token: data.token || `token-${Date.now()}`,
            };

            if (rememberMe) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            }
            set({ user: authUser, isAuthenticated: true, isLoading: false, error: null });
            return authUser;
          }
        }
      } catch (err) {
        // Fallback to local authentication table
      }

      // Local authentication matching
      const foundUser = MOCK_USERS.find(
        (u) =>
          (u.email.toLowerCase() === normalizedId || u.operatorId.toLowerCase() === normalizedId) &&
          u.passwords.includes(trimmedPassword)
      );

      if (!foundUser) {
        set({
          isLoading: false,
          error: 'Incorrect email/Operator ID or password.',
        });
        throw new Error('Incorrect email/Operator ID or password.');
      }

      const authenticatedUser: AuthenticatedUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        operatorId: foundUser.operatorId,
        role: foundUser.role,
        assignedVehicle: foundUser.assignedVehicle,
        designation: foundUser.designation,
        token: `jwt-nerlogix-${foundUser.role.toLowerCase()}-${Date.now()}`,
      };

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
      }

      set({
        user: authenticatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return authenticatedUser;
    },

    logout: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
  };
});
