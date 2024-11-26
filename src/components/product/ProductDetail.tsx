import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/useCartStore';
import { Button } from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { ShoppingCart } from 'lucide-react';
import { Image } from '../ui/image';

interface Product {
  image: string;
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  seller: {
    _id: string;
    name: string;
  };
  quantity?: number;
  createdAt: string;
  updatedAt: string;
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useCartStore(state => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery<{ data: Product }>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:8000/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });
  const handleAddToCart = () => {
    if (product?.data) {
      const cartProduct = {
        ...product.data,
        quantity: quantity
      };
      addToCart(cartProduct);
      toast.success('Added to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!product?.data) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p className="text-red-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={() => navigate('/products')}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back to Products
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Image
          src={product.data.image}
          alt={product.data.name}
          className="w-full h-96 rounded-lg"
        />

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.data.name}</h1>
          <p className="text-gray-600 mb-4">{product.data.description}</p>
          
          <div className="mb-6">
            <p className="text-2xl font-bold">₹{product.data.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Category: {product.data.category}</p>
            <p className="text-sm text-gray-500">Seller: {product.data.seller.name}</p>
            <p className={`text-sm ${product.data.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.data.stock > 0 ? `${product.data.stock} units in stock` : 'Out of stock'}
            </p>
          </div>

          {product.data.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded">
                  <button
                    className="px-3 py-1 border-r"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-1">{quantity}</span>
                  <button
                    className="px-3 py-1 border-l"
                    onClick={() => setQuantity(Math.min(product.data.stock, quantity + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};