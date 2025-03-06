import express from 'express';
import * as moviesController from '../controllers/movie.controller';

const router = express.Router();

router.get('/getPopularMovies', moviesController.getPopularMovies);
router.get('/searchMovies', moviesController.searchMovies);
router.get('/getMovieDetails/:id', moviesController.getMovieDetails);
router.post('/addToFavorites', moviesController.addToFavorites);

export default router;