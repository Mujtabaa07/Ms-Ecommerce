import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
} from '../controllers/orders.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Customer routes
router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.post('/:id/cancel', auth, cancelOrder);

// Admin/Seller only routes
router.patch('/:id/status', [auth, authorize('admin', 'seller')], updateOrderStatus);

export default router;