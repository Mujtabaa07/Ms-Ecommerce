import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import { orders } from '../utils/api';
import { toast } from 'react-hot-toast';

interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  checkout: (shippingAddress: ShippingAddress) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (product: Product, quantity: number = 1) => {
        // Validate quantity
        if (quantity <= 0) {
          toast.error('Quantity must be greater than 0');
          return;
        }

        const items = [...get().items];
        const existingItem = items.find(item => item.productId === product._id);

        if (existingItem) {
          // Check if adding quantity exceeds stock
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity <= product.stock) {
            existingItem.quantity = newQuantity;
            toast.success('Cart updated successfully');
          } else {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
          }
        } else {
          // Check if initial quantity exceeds stock
          if (quantity <= product.stock) {
            items.push({
              productId: product._id,
              quantity: quantity,
              product: product
            });
            toast.success('Item added to cart');
          } else {
            toast.error(`Only ${product.stock} items available in stock`);
            return;
          }
        }

        // Calculate total
        const total = calculateTotal(items);
        set({ items, total });
      },

      removeItem: (productId: string) => {
        const items = get().items.filter(item => item.productId !== productId);
        const total = calculateTotal(items);
        set({ items, total });
        toast.success('Item removed from cart');
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          toast.error('Quantity must be greater than 0');
          return;
        }

        const items = get().items.map(item => {
          if (item.productId === productId) {
            // Check if new quantity is within stock limits
            if (quantity <= item.product.stock) {
              return { ...item, quantity };
            } else {
              toast.error(`Only ${item.product.stock} items available in stock`);
              return item;
            }
          }
          return item;
        });

        const total = calculateTotal(items);
        set({ items, total });
      },

      clearCart: () => {
        set({ items: [], total: 0 });
        toast.success('Cart cleared');
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      checkout: async (shippingAddress: ShippingAddress) => {
        try {
          const { items, total } = get();
          
          // Validate cart is not empty
          if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
          }

          // Validate all items are in stock
          for (const item of items) {
            if (item.quantity > item.product.stock) {
              toast.error(`${item.product.name} has insufficient stock`);
              return;
            }
          }

          // Prepare order data
          const orderData = {
            items: items.map(item => ({
              product: item.productId,
              quantity: item.quantity,
              price: item.product.price
            })),
            totalAmount: total,
            shippingAddress,
            paymentMethod: 'COD' // Cash on Delivery
          };
          // Create order
          await orders.create({
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: 'COD' as const
          });
          
          // Clear cart after successful order
          get().clearCart();
          toast.success('Order placed successfully');
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to place order');
          throw error;
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        total: state.total 
      }),
    }
  )
);

// Helper function to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );
};