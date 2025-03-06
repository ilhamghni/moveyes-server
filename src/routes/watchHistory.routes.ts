import express from 'express';
import * as watchHistoryController from '../controllers/watchHistory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', authenticate, watchHistoryController.getWatchHistory);
router.post('/update', authenticate, watchHistoryController.updateWatchProgress);

export default router;