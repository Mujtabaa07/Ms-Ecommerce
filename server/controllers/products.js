import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

// Create new product
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category || !stock) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Handle image upload
    if (!req.file) {
      throw new ApiError(400, 'Product image is required');
    }

    // Create image URL
    const image = `/uploads/${req.file.filename}`;

    // Create product
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image,
      seller: req.user._id
    });

    // Populate seller details
    await product.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Get all products with optional filtering
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort = '-createdAt', minPrice, maxPrice } = req.query;
    const query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .sort(sort)
      .populate('seller', 'name email');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Get single product by ID
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Update product
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to update this product');
    }

    // Handle image upload
    let image = product.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Update product
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock) updates.stock = Number(updates.stock);

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...updates,
        image
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('seller', 'name email');

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check ownership
    if (product.seller.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Not authorized to delete this product');
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get seller's products
export const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .sort('-createdAt')
      .populate('seller', 'name email');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// Search products
export const searchProducts = async (req, res, next) => {
  try {
    const { query, category, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const searchQuery = {};

    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      searchQuery.price = {};
      if (minPrice !== undefined) searchQuery.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) searchQuery.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(searchQuery)
      .sort(sort)
      .populate('seller', 'name email');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};