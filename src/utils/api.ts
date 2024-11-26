import axios, { AxiosInstance } from 'axios';
import { 
  Product,
  LoginFormData, 
  RegisterFormData,
  ProfileUpdateData,
  PasswordChangeData,
  ProductFilters,
  DashboardStats,
  Order,
  OrderItem,
  ShippingAddress
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add better error handling and logging
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🚀 Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const products = {
  getAll: async (params?: ProductFilters) => {
    const { data } = await axiosInstance.get<{ data: Product[] }>('/products', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<{ data: Product }>(`/products/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<{ data: Product }>('/seller/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await axiosInstance.put<{ data: Product }>(`/seller/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<{ success: boolean }>(`/seller/products/${id}`);
    return data;
  },

  search: async (params: ProductFilters) => {
    const { data } = await axiosInstance.get<{ data: Product[] }>('/products/search', { params });
    return data;
  },
};

// Seller API
export const seller = {
  getProducts: async () => {
    const { data } = await axiosInstance.get<{ data: Product[] }>('/seller/products');
    return data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get<{ data: DashboardStats }>('/seller/dashboard');
    return response.data.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get<{ data: Order[] }>('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await axiosInstance.patch<{ data: Order }>(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Orders API
export const orders = {
  create: async (orderData: { items: OrderItem[], shippingAddress: ShippingAddress }) => {
    const response = await axiosInstance.post<{ data: Order }>('/orders', orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get<{ data: Order[] }>('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<{ data: Order }>(`/orders/${id}`);
    return response.data;
  },

  cancel: async (orderId: string) => {
    const response = await axiosInstance.post<{ success: boolean }>(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await axiosInstance.get<{ data: Order[] }>('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await axiosInstance.patch<{ data: Order }>(
      `/seller/orders/${orderId}/status`,
      { status }
    );
    return response.data;
  }
};

// Auth API
export const auth = {
  login: async (credentials: LoginFormData) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.message || 'Login failed',
          response: error.response
        };
      }
      throw error;
    }
  },

  register: async (userData: RegisterFormData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw {
          message: error.response?.data?.message || 'Registration failed',
          response: error.response
        };
      }
      throw error;
    }
  },

  getProfile: async () => {
    const { data } = await axiosInstance.get('/auth/profile');
    return data;
  },

  updateProfile: async (profileData: ProfileUpdateData) => {
    const { data } = await axiosInstance.put('/auth/profile', profileData);
    return data;
  },

  changePassword: async (passwordData: PasswordChangeData) => {
    const { data } = await axiosInstance.put('/auth/change-password', passwordData);
    return data;
  },
};
// Export default API object
export const api = {
  axiosInstance,
  products,
  orders,
  seller,
  auth,
};

export default api;