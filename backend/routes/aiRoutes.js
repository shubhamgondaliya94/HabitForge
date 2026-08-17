import express from 'express';
import { getCoachInsights } from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/coach', getCoachInsights);

export default router;
