import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import movieRoutes from './routes/movie.routes';
import profileRoutes from './routes/profile.routes';
import watchHistoryRoutes from './routes/watchHistory.routes';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/watch-history', watchHistoryRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});