import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import api from '../../utils/api';
import { Image } from '../../components/ui/image';

interface OrderItem {
  _id: string | number | null | undefined;
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
    _id: string | number | bigint | null | undefined; 
  user: {
    _id: string;
    name: string;
    email: string;
    
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    imageUrl: string;
  };
  paymentMethod: 'COD';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const ORDER_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export const SellerOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Redirect if not seller
  if (!user || user.role !== 'seller') {
    navigate('/login');
    return null;
  }

  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['sellerOrders'],
    queryFn: () => api.orders.getSellerOrders()
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) => 
      api.orders.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    }
  });

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      updateOrderStatusMutation.mutate({ 
        orderId, 
        status: newStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders?.data.filter((order) => {
    const matchesSearch = 
      ((order._id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders?.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {format(new Date(order.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyles(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center space-x-4 py-2">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Customer Details</h4>
                    <p className="text-sm text-gray-600">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.fullName}<br />
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                      {order.shippingAddress.pinCode}<br />
                      Phone: {order.shippingAddress.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    Total: ₹{(order.totalAmount || 0).toFixed(2)}
                  </div>
                  
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="space-x-2">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(order._id, 'processing')}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Process Order
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button
                          onClick={() => handleStatusUpdate(order._id, 'shipped')}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          disabled={updateOrderStatusMutation.isPending}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};