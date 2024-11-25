import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import orders from '../utils/api';
import { Button } from '../components/ui/Button';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch order details
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orders.orders.get(id),
    enabled: !!id,
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: () => orders.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate();
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
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-red-600 mb-4">Failed to load order details</p>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const order: Order = response.data;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Orders
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-500">
              Placed on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${getStatusBadgeStyles(order.status)}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="border-t border-b py-6 my-6">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div>
                    <h3 className="font-medium">{item.product.name}</h3>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>{order.shippingAddress.pinCode}</p>
              <p>Phone: {order.shippingAddress.phoneNumber}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Items Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charges</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {order.status === 'processing' && user?.role === 'customer' && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="secondary"
              onClick={handleCancelOrder}
              disabled={cancelOrderMutation.isPending}
            >
              {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};