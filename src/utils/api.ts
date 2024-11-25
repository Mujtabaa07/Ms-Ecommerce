import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const products = {
  // Get all products with filters
  getAll: async (params?: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const { data } = await api.get('/products', { params });
    return data;
  },

  // Get single product
  getById: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  // Create new product (for sellers)
  create: async (formData: FormData) => {
    const { data } = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Update product (for sellers)
  update: async (id: string, formData: FormData) => {
    const { data } = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // Delete product (for sellers)
  delete: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  // Search products
  search: async (params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => {
    const { data } = await api.get('/products/search', { params });
    return data;
  },
};

export const seller = {
  // Get seller's products
  getProducts: async () => {
    const { data } = await api.get('/seller/products');
    return data;
  },

  // Get seller's dashboard stats
  getDashboardStats: async () => {
    const { data } = await api.get('/seller/dashboard');
    return data;
  },

  // Get seller's orders
  getOrders: async () => {
    const { data } = await api.get('/seller/orders');
    return data;
  },
};

export const orders = {
  // Create new order
  create: async (orderData: {
    items: Array<{
      product: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingAddress: {
      fullName: string;
      phoneNumber: string;
      street: string;
      city: string;
      state: string;
      pinCode: string;
    };
    paymentMethod: 'COD';
  }) => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  // Get all orders (for customer/seller)
  getAll: async () => {
    const { data } = await api.get('/orders');
    return data;
  },

  // Get single order
  getById: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  // Update order status (for sellers)
  updateStatus: async (
    id: string, 
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ) => {
    const { data } = await api.patch(`/orders/${id}/status`, { status });
    return data;
  },

  // Cancel order (for customers)
  cancel: async (id: string) => {
    const { data } = await api.post(`/orders/${id}/cancel`);
    return data;
  },
};

export const auth = {
  // Login
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  // Register
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'customer' | 'seller';
  }) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  // Get user profile
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  // Update profile
  updateProfile: async (profileData: {
    name?: string;
    phoneNumber?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      pinCode: string;
    };
  }) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  },
};

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  ...api,
  products,
  orders,
  seller,
  auth,
};