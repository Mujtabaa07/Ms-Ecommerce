import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem } = useCartStore();
  const { user } = useAuthStore();

  // Authentication & Role Check
  if (!user || user.role !== 'customer') {
    navigate('/login');
    return null;
  }

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-2 text-lg font-medium text-gray-900">
          Your cart is empty
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Start shopping to add items to your cart
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Calculate Order Summary
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity), 
    0
  );
  const shipping = 0; // Free shipping
  const totalAmount = subtotal + shipping;
  const savings = subtotal * 0.1; // 10% savings calculation

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div 
              key={item.productId} 
              className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
            >
              {/* Product Image */}
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.jpg';
                }}
              />
              
              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.product.category}
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{item.product.price.toFixed(2)}
                </p>
                {item.quantity > item.product.stock && (
                  <p className="text-sm text-red-600">
                    Only {item.product.stock} items available
                  </p>
                )}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <span className="w-12 text-center">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Item Total & Remove */}
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:text-red-700 mt-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6 h-fit space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Summary
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price ({items.length} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Charges</span>
              <span className="text-green-600">FREE</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-green-600 text-sm mt-2">
                You will save ₹{savings.toFixed(2)} on this order
              </p>
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate('/checkout')}
            disabled={
              items.length === 0 || 
              items.some(item => item.quantity > item.product.stock)
            }
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};