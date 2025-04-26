import express from 'express';
import {
  getDashboardSummary,
  getSpendingInsights
} from '../controllers/dashboardController';

const router = express.Router();

// Dashboard routes
router.get('/', getDashboardSummary);
router.get('/insights', getSpendingInsights);

export default router;