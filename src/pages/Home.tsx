import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '../components/product/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Product, ProductFilters } from '../types';
import api from '../utils/api';
import { Search } from 'lucide-react';

export const Home: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    sort: 'newest',
    minPrice: undefined,
    maxPrice: undefined,
  });

  // Fetch products with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.products.getAll(filters);
      return response;
    },
  });

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-red-600">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  // Get products array safely
  const products = Array.isArray(data?.data) ? data.data : [];

  // Empty state
  if (products.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center text-gray-600">
          No products available.
        </div>
      </div>
    );
  }

  // Handle filter changes
  const handleFilterChange = (
    key: keyof ProductFilters,
    value: string | number | undefined
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            {/* Add more categories as needed */}
          </select>
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Min Price"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            placeholder="Max Price"
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: Product) => (
          <ProductCard 
            key={product._id} 
            product={product}
          />
        ))}
      </div>
    </div>
  );
};