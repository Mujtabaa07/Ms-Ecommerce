import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Protect routes middleware
export const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, 'Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

// Role authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Not authorized to access this route'));
    }
    next();
  };
};

// Protect seller routes middleware
export const protectSellerRoute = async (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller only route'
    });
  }
  next();
};

// Export the middleware functions
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, 'Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};