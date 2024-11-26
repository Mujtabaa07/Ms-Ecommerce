import express from 'express';
import { auth, authorize } from '../middleware/auth.js';
import { getSellerOrders, updateOrderStatus } from '../controllers/seller.js';

const router = express.Router();

router.get('/orders', auth, authorize('seller'), getSellerOrders);
router.put('/orders/:id/status', auth, authorize('seller'), updateOrderStatus);

export default router;