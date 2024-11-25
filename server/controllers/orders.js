import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

// Create new order
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    if (!shippingAddress) {
      throw new ApiError(400, 'Shipping address is required');
    }

    let total = 0;
    const orderItems = [];

    // Validate and process each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        throw new ApiError(404, `Product ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      // Calculate item total and update product stock
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress,
      status: 'pending'
    });

    await order.save();

    // Populate product details in response
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders
export const getOrders = async (req, res, next) => {
  try {
    let query = {};

    // Regular customers can only see their orders
    if (req.user.role === 'customer') {
      query.user = req.user._id;
    }
    // Sellers can see orders containing their products
    else if (req.user.role === 'seller') {
      query['items.product.seller'] = req.user._id;
    }
    // Admins can see all orders

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get specific order
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check authorization
    if (req.user.role === 'customer' && 
        order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    // For sellers, check if they have any products in the order
    if (req.user.role === 'seller') {
      const hasSellerProducts = order.items.some(
        item => item.product.seller.toString() === req.user._id.toString()
      );
      if (!hasSellerProducts) {
        throw new ApiError(403, 'Not authorized to view this order');
      }
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Update order status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      throw new ApiError(400, 'Invalid order status');
    }

    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Check authorization
    if (req.user.role === 'seller') {
      const hasSellerProducts = order.items.some(
        item => item.product.seller.toString() === req.user._id.toString()
      );
      if (!hasSellerProducts) {
        throw new ApiError(403, 'Not authorized to update this order');
      }
    } else if (req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update order status');
    }

    // If order is being cancelled, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order (customer only)
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Only the customer who placed the order can cancel it
    if (order.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to cancel this order');
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      throw new ApiError(400, 'Can only cancel pending orders');
    }

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};