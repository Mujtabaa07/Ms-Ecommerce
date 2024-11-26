import { Key } from "react";

// Product related interfaces
export interface Product {
  rating: any;
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  
  category: string;
  stock: number;
  seller: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// User related interfaces
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  phoneNumber?: string;
  address?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

// Cart related interfaces
export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

// Address interface
export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

// Order related interfaces
export interface OrderItem {
  _id: Key | null | undefined;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'COD';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Form Data interfaces
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'seller';
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: File;
}

export interface ProfileUpdateData {
  name?: string;
  phoneNumber?: string;
  address?: ShippingAddress;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

// Filter and Sort interfaces
export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  minPrice?: number;
  maxPrice?: number;
}

// Dashboard Stats interface
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}