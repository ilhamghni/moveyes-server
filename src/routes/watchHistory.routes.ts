import express from 'express';
import * as watchHistoryController from '../controllers/watchHistory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Add logging middleware for watch history routes
router.use('/', (req, res, next) => {
  console.log(`API called: Watch History GET at ${new Date().toISOString()}`);
  next();
});

router.use('/update', (req, res, next) => {
  console.log(`API called: Update Watch Progress with body: ${JSON.stringify(req.body)} at ${new Date().toISOString()}`);
  next();
});

router.get('/', authenticate, watchHistoryController.getWatchHistory);
router.post('/update', authenticate, watchHistoryController.updateWatchProgress);

export default router;