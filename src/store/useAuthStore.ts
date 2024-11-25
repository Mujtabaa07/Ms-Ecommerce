import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../utils/api';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginData) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await auth.login(credentials);
          localStorage.setItem('token', data.token);
          set({ 
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false 
          });
          toast.success('Logged in successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await auth.register(userData);
          localStorage.setItem('token', data.token);
          set({ 
            token: data.token,
            user: data.user,
            isAuthenticated: true,
            isLoading: false 
          });
          toast.success('Registration successful');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ 
          token: null,
          user: null,
          isAuthenticated: false,
          error: null 
        });
        toast.success('Logged out successfully');
      },

      loadUser: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isLoading: false });
            return;
          }

          set({ isLoading: true, error: null });
          const { data } = await auth.getProfile();
          set({ 
            user: data.user,
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error: any) {
          localStorage.removeItem('token');
          set({ 
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load user'
          });
        }
      },

      updateProfile: async (profileData: UpdateProfileData) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await auth.updateProfile(profileData);
          set({ 
            user: data.user,
            isLoading: false 
          });
          toast.success('Profile updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      changePassword: async (passwordData: ChangePasswordData) => {
        try {
          set({ isLoading: true, error: null });
          await auth.changePassword(passwordData);
          set({ isLoading: false });
          toast.success('Password changed successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Password change failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user
      }),
    }
  )
);