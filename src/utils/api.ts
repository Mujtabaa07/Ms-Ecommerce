import axios, { AxiosInstance } from 'axios';
import type { 
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

// API Base URL
const API_URL = 'https://ms-ecommerce-production.up.railway.app';


// Axios Instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
});

// Debug Interceptors
axiosInstance.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject({
      message: error.response?.data?.message || 'An error occurred',
      response: error.response
    });
  }
);
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Products API
export const products = {
  getAll: async (params?: ProductFilters): Promise<Product[]> => {
    try {
      const { data } = await axiosInstance.get('/api/products', { params });
      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    const { data } = await axiosInstance.get(`/api/products/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post('/api/products', formData);
    return data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await axiosInstance.put(`/seller/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete(`/seller/products/${id}`);
    return data;
  },

  search: async (params: ProductFilters) => {
    const { data } = await axiosInstance.get('/products/search', { params });
    return data;
  },
};

// Seller API
export const seller = {
  getProducts: async () => {
    const { data } = await axiosInstance.get('/seller/products');
    return data;
  },

  getDashboard: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<{ data: DashboardStats }>('/api/seller/dashboard');
    return response.data.data;
  },

  getOrders: async () => {
    const response = await axiosInstance.get('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await axiosInstance.patch(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Orders API
export const orders = {
  create: async (orderData: { items: OrderItem[], shippingAddress: ShippingAddress }) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  cancel: async (orderId: string) => {
    const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await axiosInstance.get('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await axiosInstance.patch(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Auth API
export const auth = {
  login: async (credentials: LoginFormData) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterFormData) => {
    try {
      const { data } = await axiosInstance.post('/api/auth/register', userData);
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    const { data } = await axiosInstance.get('/api/auth/profile');
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
