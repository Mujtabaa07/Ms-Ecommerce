import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();

  const handleAddToCart = () => {
    if (product.stock > 0) {
      // Pass the product directly, as addItem expects a Product
      addItem(product, 1); // Pass product and quantity
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.jpg'; // Add a placeholder image
            }}
          />
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              Out of Stock
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-2">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        <div className="text-sm text-gray-500">
          Category: {product.category}
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <div className="text-sm text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          </div>
          
          {user?.role === 'customer' && (
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              variant={product.stock === 0 ? "outline" : "primary"}
              size="sm"
              className="flex items-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </Button>
          )}
        </div>

        {typeof product.seller !== 'string' && (
          <div className="text-xs text-gray-500 pt-2">
            Sold by: {product.seller.name}
          </div>
        )}
      </div>
    </div>
  );
};