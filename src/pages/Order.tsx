import React from 'react';
import { useQuery } from '@tanstack/react-query';
import orders from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { Order } from '../types/order';

export const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const { data, isLoading, error, refetch } = useQuery<{ data: Order[] }>({
    queryKey: ['orders'],
    queryFn: () => orders.get('/orders'),
  });

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orders.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadgeStyles = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <p className="text-red-600 mb-4">Failed to load orders</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {!data?.data?.length ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No orders found</h2>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Placed on {format(new Date(order.createdAt), 'PPP')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t border-b py-4 my-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-2">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div>
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Shipping Address:</span>
                  <span className="text-right">
                    {order.shippingAddress.fullName}<br />
                    {order.shippingAddress.phoneNumber}<br />
                    {order.shippingAddress.street}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                    {order.shippingAddress.pinCode}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-medium">Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {order.status === 'processing' && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};