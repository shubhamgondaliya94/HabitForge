import express from 'express';
import { toggleCompletion, getHeatmapData, getAnalyticsData, exportCSV } from '../controllers/completionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/toggle', toggleCompletion);
router.get('/heatmap', getHeatmapData);
router.get('/analytics', getAnalyticsData);
router.get('/export', exportCSV);

export default router;
