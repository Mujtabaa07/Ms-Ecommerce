import axios from 'axios';
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


const baseURL = import.meta.env.PROD 
  ? 'https://ms-ecommerce-production.up.railway.app'
  : 'http://localhost:8000';
// Axios Instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Add request interceptor to axiosInstance instead of undefined api
api.interceptors.request.use(
  (config: any) => {
    console.log('API Request:', {
      method: config.method,
      url: config.baseURL + config.url,
      data: config.data,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// Debug Interceptors
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.url);
  const token = localStorage.getItem('token');
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

api.interceptors.response.use(
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
api.interceptors.request.use(
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
      const { data } = await api.get('/api/products', { params });
      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  getOne: async (id: string) => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await api.post('/api/products', formData);
    return data;
  },

  update: async (id: string, formData: FormData) => {
    const { data } = await api.put(`/seller/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/seller/products/${id}`);
    return data;
  },

  search: async (params: ProductFilters) => {
    const { data } = await api.get('/products/search', { params });
    return data;
  },
};

// Seller API
export const seller = {
  getProducts: async () => {
    const { data } = await api.get('/seller/products');
    return data;
  },

  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<{ data: DashboardStats }>('/api/seller/dashboard');
    return response.data.data;
  },

  getOrders: async () => {
    const response = await api.get('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await api.patch(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Orders API
export const orders = {
  create: async (orderData: { items: OrderItem[], shippingAddress: ShippingAddress }) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancel: async (orderId: string) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  getSellerOrders: async () => {
    const response = await api.get('/seller/orders');
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await api.patch(`/seller/orders/${orderId}/status`, { status });
    return response.data;
  }
};

// Auth API
export const auth = {
  login: async (credentials: LoginFormData) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
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
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    const { data } = await api.get('/api/auth/profile');
    return data;
  },

  updateProfile: async (profileData: ProfileUpdateData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },

  changePassword: async (passwordData: PasswordChangeData) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  },
};

// Export default API object
export const apiClient = {
  api,
  products,
  orders,
  seller,
  auth,
};

export default apiClient;
