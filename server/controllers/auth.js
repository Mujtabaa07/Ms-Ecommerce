import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

// Helper function to generate JWT token
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to sanitize user data for response
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar
});

// Register user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    // Validate role
    if (!['admin', 'seller', 'customer'].includes(role)) {
      throw new ApiError(400, 'Invalid role specified');
    }

    // Create user
    const user = new User({ 
      name, 
      email, 
      password,
      role 
    });
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Check user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check if new email is already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ApiError(400, 'Email already in use');
      }
      user.email = email;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide current and new password');
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};