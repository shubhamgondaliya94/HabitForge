import express from 'express';
import { register, login, getProfile, togglePremium, updateProfile, addFriend, deleteAccount } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.post('/toggle-premium', authenticate, togglePremium);
router.put('/profile', authenticate, updateProfile);
router.post('/add-friend', authenticate, addFriend);
router.delete('/account', authenticate, deleteAccount);

export default router;
