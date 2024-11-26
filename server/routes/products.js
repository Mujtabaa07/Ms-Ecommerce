import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  searchProducts
} from '../controllers/products.js';
import path from 'path';
import { auth, authorize } from '../middleware/auth.js';
import { storage } from '../cloudinary.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage });

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Seller routes
router.get('/seller/products', auth, authorize('seller'), getSellerProducts);
router.post('/', auth, authorize('seller'), upload.single('image'), createProduct);
router.put('/:id', auth, authorize('seller'), upload.single('image'), updateProduct);
router.delete('/:id', auth, authorize('seller'), deleteProduct);

export default router;