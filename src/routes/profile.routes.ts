import express from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Add logging middleware for profile routes
router.use('/', (req, res, next) => {
  console.log(`API called: Profile ${req.method} at ${new Date().toISOString()}`);
  next();
});

router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);

export default router;