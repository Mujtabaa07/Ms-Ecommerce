// Create this new file in your controllers directory

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { cloudinary } from '../cloudinary.js';

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

export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .populate('seller', 'name email');

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    if (!req.file) {
      throw new ApiError(400, 'Product image is required');
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image: req.file.path,
      seller: req.user._id
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to update this product');
    }

    let image = product.image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = result.secure_url;
    }

    const updates = { ...req.body, image };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock) updates.stock = Number(updates.stock);

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to delete this product');
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};