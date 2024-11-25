import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/product/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import api from '../utils/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  seller: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const Home: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-600">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  // Check if data exists and is an array
  const products = Array.isArray(data?.data) ? data.data : [];

  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-gray-600">
          No products available.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Featured Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <ProductCard 
            key={product._id} 
            product={{...product, quantity: 0}}
          />
        ))}
      </div>
    </div>
  );
};