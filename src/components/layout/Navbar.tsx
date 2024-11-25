import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { ShoppingCart, User, Package, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  
  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center"
            >
              <h1 className="text-xl font-bold text-gray-900">
                Creative Stationery
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'seller' ? (
                  /* Seller Navigation */
                  <div className="flex items-center space-x-6">
                    <Link 
                      to="/seller/dashboard" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      to="/seller/products" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <Package className="w-5 h-5" />
                      <span>Products</span>
                    </Link>
                    <Link 
                      to="/seller/orders" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Orders</span>
                    </Link>
                  </div>
                ) : (
                  /* Customer Navigation */
                  <div className="flex items-center space-x-6">
                    <Link 
                      to="/cart" 
                      className="relative text-gray-700 hover:text-gray-900"
                    >
                      <ShoppingCart className="w-6 h-6" />
                      {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <Package className="w-5 h-5" />
                      <span>Orders</span>
                    </Link>
                  </div>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-4 ml-6">
                  <Link 
                    to="/account" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">{user?.name}</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              /* Guest Navigation */
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};