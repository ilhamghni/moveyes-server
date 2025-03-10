import express from 'express';
import * as moviesController from '../controllers/movie.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// Add logging middleware for each endpoint
router.use('/getPopularMovies', (req, res, next) => {
  console.log('API called: getPopularMovies at', new Date().toISOString());
  next();
});

router.use('/searchMovies', (req, res, next) => {
  console.log('API called: searchMovies with query:', req.query, 'at', new Date().toISOString());
  next();
});

router.use('/getMovieDetails/:id', (req, res, next) => {
  console.log('API called: getMovieDetails for ID:', req.params.id, 'at', new Date().toISOString());
  next();
});

router.use('/addToFavorites', (req, res, next) => {
  console.log('API called: addToFavorites with body:', req.body, 'at', new Date().toISOString());
  next();
});

router.use('/favorites', (req, res, next) => {
  console.log('API called: getFavorites at', new Date().toISOString());
  next();
});

router.use('/favorites/:movieId', (req, res, next) => {
  console.log('API called: removeFromFavorites for movieId:', req.params.movieId, 'at', new Date().toISOString());
  next();
});

// Add logging for the new endpoint
router.use('/checkFavorite/:tmdbId', (req, res, next) => {
  console.log(`API called: checkFavorite for tmdbId: ${req.params.tmdbId} at ${new Date().toISOString()}`);
  next();
});

// Public routes
router.get('/getPopularMovies', moviesController.getPopularMovies);
router.get('/searchMovies', moviesController.searchMovies);
router.get('/getMovieDetails/:id', moviesController.getMovieDetails);

// Protected routes - require authentication
router.post('/addToFavorites', authenticate, moviesController.addToFavorites);
router.get('/favorites', authenticate, moviesController.getFavorites);
router.delete('/favorites/:movieId', authenticate, moviesController.removeFromFavorites);
router.get('/checkFavorite/:tmdbId', authenticate, moviesController.checkFavoriteStatus);

export default router;