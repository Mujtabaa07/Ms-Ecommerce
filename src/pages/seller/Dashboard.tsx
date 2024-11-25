import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// API function to get seller stats
const getSellerStats = async () => {
  const response = await fetch('http://localhost:8000/api/seller/dashboard', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: Array<{
      product: {
        name: string;
      };
      quantity: number;
      price: number;
    }>;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if not seller
  if (!user || user.role !== 'seller') {
    navigate('/login');
    return null;
  }

  const { data: stats, isLoading, error } = useQuery<{ data: DashboardStats }>({
    queryKey: ['sellerStats'],
    queryFn: getSellerStats,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const dashboardData = stats?.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold">{dashboardData?.totalProducts}</h3>
            </div>
            <Package className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">{dashboardData?.totalOrders}</h3>
            </div>
            <ShoppingBag className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{dashboardData?.totalRevenue.toFixed(2)}</h3>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboardData?.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <div className="space-y-4">
            {Object.entries(dashboardData?.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  {status === 'delivered' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : status === 'cancelled' ? (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  )}
                  <span className="capitalize">{status}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {dashboardData?.recentOrders.map((order) => (
              <div 
                key={order._id} 
                className="border-b last:border-0 pb-4 last:pb-0"
                onClick={() => navigate(`/seller/orders/${order._id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'PPP')}
                    </p>
                    <p className="text-sm">
                      {order.items.map(item => 
                        `${item.product.name} (${item.quantity})`
                      ).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};