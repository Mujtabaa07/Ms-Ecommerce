// First, let's define our interfaces
export interface OrderItem {
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
  
  export interface ShippingAddress {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
  }
  
  export interface Order {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    items: OrderItem[];
    totalAmount: number;
    shippingAddress: ShippingAddress;
    paymentMethod: 'COD';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DashboardData {
    stats: {
      totalOrders: number;
      totalRevenue: number;
      pendingOrders: number;
      processingOrders: number;
    };
    recentOrders: Order[];
  }