import { create } from 'zustand';
import { AuthenticatedUser, AuthState, LoginCredentials, RegisterCredentials, GoogleCredentials } from '../types/auth';

const STORAGE_KEY = 'nerlogix_auth_user';

const getAuthApiUrl = (endpoint: string) => {
  return typeof window !== 'undefined' && window.location.port === '5173'
    ? `http://localhost:3001/api/auth/${endpoint}`
    : `/api/auth/${endpoint}`;
};

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const normalizedId = identifier.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Attempt to hit backend server if available
      try {
        const response = await fetch(getAuthApiUrl('login'), {
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
              authProvider: 'password',
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

      // Local authentication matching from MOCK_USERS
      const foundUser = MOCK_USERS.find(
        (u) =>
          (u.email.toLowerCase() === normalizedId || u.operatorId.toLowerCase() === normalizedId) &&
          u.passwords.includes(trimmedPassword)
      );

      if (foundUser) {
        const authenticatedUser: AuthenticatedUser = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          operatorId: foundUser.operatorId,
          role: foundUser.role,
          assignedVehicle: foundUser.assignedVehicle,
          designation: foundUser.designation,
          token: `jwt-nerlogix-${foundUser.role.toLowerCase()}-${Date.now()}`,
          authProvider: 'password',
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
      }

      // Support ANY valid email login smoothly
      if (normalizedId.includes('@') && trimmedPassword.length >= 1) {
        const role = normalizedId.includes('driver')
          ? 'DRIVER'
          : normalizedId.includes('sim')
          ? 'SIMULATION_OPERATOR'
          : 'ADMIN';
        const rolePrefix = role === 'DRIVER' ? 'DRV' : role === 'SIMULATION_OPERATOR' ? 'SIM' : 'ADM';

        const anyEmailUser: AuthenticatedUser = {
          id: `USR-${rolePrefix}-${Date.now().toString().slice(-4)}`,
          name: normalizedId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: normalizedId,
          operatorId: `${rolePrefix}-${Math.floor(10 + Math.random() * 90)}`,
          role,
          designation:
            role === 'DRIVER'
              ? 'Senior Heavy Freight Pilot'
              : role === 'SIMULATION_OPERATOR'
              ? 'Tactical Disaster Simulator'
              : 'Logistics Controller',
          assignedVehicle: role === 'DRIVER' ? 'NER-TRK-01' : undefined,
          token: `jwt-nerlogix-${role.toLowerCase()}-${Date.now()}`,
          authProvider: 'password',
        };

        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(anyEmailUser));
        }

        set({
          user: anyEmailUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return anyEmailUser;
      }

      set({
        isLoading: false,
        error: 'Please enter a valid email and password.',
      });
      throw new Error('Please enter a valid email and password.');
    },

    register: async ({ name, email, password = 'password', role, designation, rememberMe = true }: RegisterCredentials): Promise<AuthenticatedUser> => {
      set({ isLoading: true, error: null });
      await new Promise((resolve) => setTimeout(resolve, 500));

      const normalizedEmail = email.trim().toLowerCase();

      try {
        const response = await fetch(getAuthApiUrl('register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email: normalizedEmail, password, role, designation }),
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          if (data.user) {
            const authUser: AuthenticatedUser = {
              ...data.user,
              token: data.token || `token-${Date.now()}`,
              authProvider: 'password',
            };

            if (rememberMe) {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            }
            set({ user: authUser, isAuthenticated: true, isLoading: false, error: null });
            return authUser;
          }
        }
      } catch (err) {
        // Fallback to local creation
      }

      const rolePrefix = role === 'DRIVER' ? 'DRV' : role === 'SIMULATION_OPERATOR' ? 'SIM' : 'ADM';
      const newUser: AuthenticatedUser = {
        id: `USR-${rolePrefix}-${Date.now().toString().slice(-4)}`,
        name: name.trim() || normalizedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalizedEmail,
        operatorId: `${rolePrefix}-${Math.floor(10 + Math.random() * 90)}`,
        role,
        designation:
          designation ||
          (role === 'DRIVER'
            ? 'Senior Heavy Freight Pilot'
            : role === 'SIMULATION_OPERATOR'
            ? 'Tactical Disaster Simulator'
            : 'Logistics Controller'),
        assignedVehicle: role === 'DRIVER' ? 'NER-TRK-01' : undefined,
        token: `jwt-nerlogix-${role.toLowerCase()}-${Date.now()}`,
        authProvider: 'password',
      };

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      }

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return newUser;
    },

    loginWithGoogle: async (googleData?: GoogleCredentials): Promise<AuthenticatedUser> => {
      set({ isLoading: true, error: null });
      await new Promise((resolve) => setTimeout(resolve, 450));

      const email = googleData?.email?.trim().toLowerCase() || 'commander.nerlogix@gmail.com';
      const name =
        googleData?.name?.trim() ||
        email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const role = googleData?.role || 'ADMIN';
      const avatar = googleData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

      try {
        const response = await fetch(getAuthApiUrl('google'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, avatar, role }),
        }).catch(() => null);

        if (response && response.ok) {
          const data = await response.json();
          if (data.user) {
            const authUser: AuthenticatedUser = {
              ...data.user,
              avatar: data.user.avatar || avatar,
              token: data.token || `token-google-${Date.now()}`,
              authProvider: 'google',
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
            set({ user: authUser, isAuthenticated: true, isLoading: false, error: null });
            return authUser;
          }
        }
      } catch (err) {
        // Fallback to local
      }

      const rolePrefix = role === 'DRIVER' ? 'DRV' : role === 'SIMULATION_OPERATOR' ? 'SIM' : 'ADM';
      const googleUser: AuthenticatedUser = {
        id: `USR-GGL-${Date.now().toString().slice(-4)}`,
        name,
        email,
        operatorId: `${rolePrefix}-GGL`,
        role,
        avatar,
        designation:
          role === 'DRIVER'
            ? 'Senior Heavy Freight Pilot (Google)'
            : role === 'SIMULATION_OPERATOR'
            ? 'Tactical Disaster Simulator (Google)'
            : 'Chief Logistics Controller (Google)',
        assignedVehicle: role === 'DRIVER' ? 'NER-TRK-01' : undefined,
        token: `jwt-nerlogix-google-${Date.now()}`,
        authProvider: 'google',
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      set({ user: googleUser, isAuthenticated: true, isLoading: false, error: null });
      return googleUser;
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
