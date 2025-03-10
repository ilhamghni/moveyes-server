import express, { Request, Response } from 'express';
import * as authController from '../controllers/auth.controller';

const router = express.Router();

// Add logging middleware for auth routes
router.use('/register', (req, res, next) => {
  console.log(`API called: Register at ${new Date().toISOString()}`);
  next();
});

router.use('/login', (req, res, next) => {
  console.log(`API called: Login with email: ${req.body.email} at ${new Date().toISOString()}`);
  next();
});

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;