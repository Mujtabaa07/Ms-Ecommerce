import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Authentication middleware
export const auth = async (req, res, next) => {
  try {
    // Get token from header (supports both formats: "Bearer token" or "token")
    const token = req.headers.authorization?.split(' ')[1] || 
                 req.headers.authorization ||
                 req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token has expired');
      }
      throw new ApiError(401, 'Invalid authentication token');
    }

    // Find user and exclude password
    const user = await User.findById(decoded.userId || decoded.id)
                          .select('-password')
                          .exec();
    
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(401, 'User account is deactivated');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Pass ApiErrors directly, wrap other errors
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Authentication failed'));
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, `Role '${req.user.role}' is not authorized to access this route`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Optional auth middleware - doesn't require authentication but attaches user if token present
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || 
                 req.headers.authorization ||
                 req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId || decoded.id)
                          .select('-password')
                          .exec();
    
    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Silently fail and continue without user
    next();
  }
};