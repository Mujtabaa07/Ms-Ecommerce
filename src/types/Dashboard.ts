export interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Array<{
      _id: string;
      totalAmount: number;
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
      createdAt: string;
      items: Array<{
        product: {
          name: string;
          imageUrl: string;
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