import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.route('/register')
  .post(register)
  .options((req, res) => {
    res.header('Allow', 'POST');
    res.status(204).send();
  });

router.route('/login')
  .post(login)
  .options((req, res) => {
    res.header('Allow', 'POST');
    res.status(204).send();
  });
// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/change-password', auth, changePassword);

export default router;