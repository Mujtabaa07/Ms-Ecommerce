import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { createProduct, updateProduct, deleteProduct, getSellerProducts } from '../controllers/seller.js';
import multer from 'multer';
import { storage } from '../cloudinary.js';

const router = express.Router();
const upload = multer({ storage });

// Product routes
router.get('/products', auth, authorize('seller'), getSellerProducts);
router.post('/products', auth, authorize('seller'), upload.single('image'), createProduct);
router.put('/products/:id', auth, authorize('seller'), upload.single('image'), updateProduct);
router.delete('/products/:id', auth, authorize('seller'), deleteProduct);

export default router;