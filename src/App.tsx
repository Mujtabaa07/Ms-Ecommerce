import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { ProductDetail } from './components/product/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Order';
import { OrderDetail } from './pages/orderDetail';
import { useAuthStore } from './store/useAuthStore';
import { SellerDashboard } from './pages/seller/Dashboard';
import { SellerProducts } from './pages/seller/products';
import { SellerOrders } from './pages/seller/Orders';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { loadUser, isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" /> : <Register />}
              />

              {/* Protected Customer Routes */}
              <Route
                path="/cart"
                element={
                  isAuthenticated && user?.role === 'customer' ? (
                    <Cart />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/checkout"
                element={
                  isAuthenticated && user?.role === 'customer' ? (
                    <Checkout />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/orders"
                element={
                  isAuthenticated && user?.role === 'customer' ? (
                    <Orders />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/orders/:id"
                element={
                  isAuthenticated && user?.role === 'customer' ? (
                    <OrderDetail />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Protected Seller Routes */}
              <Route
                path="/seller/dashboard"
                element={
                  isAuthenticated && user?.role === 'seller' ? (
                    <SellerDashboard />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/seller/products"
                element={
                  isAuthenticated && user?.role === 'seller' ? (
                    <SellerProducts />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/seller/orders"
                element={
                  isAuthenticated && user?.role === 'seller' ? (
                    <SellerOrders />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Account Route (Available for all authenticated users) */}
              <Route
                path="/account"
                element={isAuthenticated ? <Account /> : <Navigate to="/login" />}
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;