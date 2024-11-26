import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { Button } from '../ui/Button';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingCart, Star } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatPrice } from '../../lib/utils';
import { toast } from 'react-hot-toast';
import { Image } from '../ui/image';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { user } = useAuthStore();

  const handleAddToCart = () => {
    try {
      if (!user) {
        toast.error('Please login to add items to cart');
        return;
      }

      if (product.stock <= 0) {
        toast.error('Product is out of stock');
        return;
      }

      addItem(product, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const renderStockStatus = () => {
    if (product.stock <= 0) {
      return <span className="text-red-600">Out of stock</span>;
    }
    if (product.stock <= 5) {
      return <span className="text-orange-600">Only {product.stock} left</span>;
    }
    return <span className="text-green-600">{product.stock} in stock</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Product Image with Link */}
      <Link 
        to={`/products/${product._id}`}
        className="block relative h-48 overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          className="w-full h-48"
        />
        {product.stock <= 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Out of Stock
          </div>
        )}
      </Link>
      
      {/* Product Details */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <Link 
          to={`/products/${product._id}`}
          className="block"
        >
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        
        {/* Product Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        {/* Product Category */}
        <div className="text-sm text-gray-500 capitalize">
          Category: {product.category}
        </div>
        
        {/* Price and Stock Status */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <div className="text-sm">
              {renderStockStatus()}
            </div>
          </div>
          
          {/* Add to Cart Button - Only show for customers */}
          {user?.role === 'customer' && (
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              variant={product.stock === 0 ? "outline" : "primary"}
              size="sm"
              className="flex items-center space-x-2 transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
            </Button>
          )}
        </div>

        {/* Seller Information */}
        {typeof product.seller !== 'string' && (
          <div className="text-xs text-gray-500 pt-2 flex items-center justify-between">
            <span>Sold by: {product.seller.name}</span>
            {product.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};