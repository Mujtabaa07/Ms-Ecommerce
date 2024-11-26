import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../utils/api';
import { toast } from 'react-hot-toast';

// Types
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

interface AuthState {
  token: string | null;
  user: User | null;
  
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => void;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateData) => Promise<void>;
  changePassword: (passwordData: PasswordChangeData) => Promise<void>;
  clearError: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

interface ProfileUpdateData {
  name?: string;
  phoneNumber?: string;
  address?: {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface LoginPayload {
  token: string;
  user: any;
}

// Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Auth methods
      login: (payload: LoginPayload) => {
        try {
          if (!payload.token || !payload.user) {
            throw new Error('Invalid login payload');
          }

          localStorage.setItem('token', payload.token);
          set({ 
            token: payload.token,
            user: payload.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          toast.success('Login successful');
        } catch (error: any) {
          set({ 
            error: error.message,
            isLoading: false 
          });
          toast.error(error.message);
          throw error;
        }
      },

      register: async (userData: RegisterFormData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await auth.register(userData);
          
          if (response.success && response.data) {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            set({ 
              token,
              user,
              isAuthenticated: true,
              isLoading: false 
            });
            toast.success('Registration successful');
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ error: errorMessage, isLoading: false });
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
          
          if (!data.user) {
            throw new Error('Invalid response from server');
          }

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

      updateProfile: async (profileData: ProfileUpdateData) => {
        try {
          set({ isLoading: true, error: null });
          const { data } = await auth.updateProfile(profileData);
          
          if (!data.user) {
            throw new Error('Invalid response from server');
          }

          set({ 
            user: data.user,
            isLoading: false 
          });
          toast.success('Profile updated successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Profile update failed';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      changePassword: async (passwordData: PasswordChangeData) => {
        try {
          set({ isLoading: true, error: null });
          await auth.changePassword(passwordData);
          set({ isLoading: false });
          toast.success('Password changed successfully');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Password change failed';
          set({ error: errorMessage, isLoading: false });
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