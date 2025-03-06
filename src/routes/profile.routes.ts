import express from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', authenticate, profileController.getProfile);
router.put('/', authenticate, profileController.updateProfile);

export default router;