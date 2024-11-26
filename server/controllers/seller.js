// Create this new file in your controllers directory

import Order from '../models/Order.js';

export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'items.product.seller': req.user._id })
      .populate('user', 'name email')
      .populate('items.product')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (req, res) => {
    try {
        // Add your get seller products logic here
        res.status(200).json({
            success: true,
            message: 'Seller products retrieved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        // Add your create product logic here
        res.status(201).json({
            success: true,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        // Add your update product logic here
        res.status(200).json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        // Add your delete product logic here
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};