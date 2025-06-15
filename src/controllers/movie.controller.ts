import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Gunakan shared instance
import * as tmdbService from '../services/tmdb.service';

export const getPopularMovies = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const popularMovies = await tmdbService.fetchPopularMovies(page);
    
    res.json(popularMovies);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ message: 'Failed to fetch popular movies' });
  }
};

export const searchMovies = async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const results = await tmdbService.searchMovies(query, page);
    res.json(results);
  } catch (error) {
    console.error('Error searching movies:', error);
    res.status(500).json({ message: 'Failed to search movies' });
  }
};

export const getMovieDetails = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);
    const movieDetails = await tmdbService.fetchMovieDetails(movieId);
    
    res.json(movieDetails);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ message: 'Failed to fetch movie details' });
  }
};

export const addToFavorites = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('Add to favorites request received');
    console.log('User from request:', req.user);
    console.log('Request body:', req.body);
    
    const userId = req.user?.id;
    if (!userId) {
      console.log('Authentication failed: No user ID in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { tmdbId, title, posterPath } = req.body;
    
    console.log(`Processing favorite for user ${userId}, movie ${tmdbId}`);
    
    let movie = await prisma.movie.findUnique({
      where: { tmdbId }
    });
    
    if (!movie) {
      console.log(`Movie ${tmdbId} not found in database, fetching from TMDB`);
      const movieDetails = await tmdbService.fetchMovieDetails(tmdbId);
      
      movie = await prisma.movie.create({
        data: {
          tmdbId,
          title: movieDetails.title,
          overview: movieDetails.overview,
          posterPath: movieDetails.poster_path,
          backdropPath: movieDetails.backdrop_path,
          releaseDate: movieDetails.release_date ? new Date(movieDetails.release_date) : null,
          voteAverage: movieDetails.vote_average
        }
      });
      console.log('Movie created in database');
    }
    
    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        movieId: movie.id
      }
    });

    if (existingFavorite) {
      console.log('Movie already in favorites');
      return res.json({ 
        message: 'Movie already in favorites', 
        favorite: existingFavorite 
      });
    }
    
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        movieId: movie.id
      },
      include: {
        movie: true
      }
    });
    
    console.log('Favorite successfully added');
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Failed to add movie to favorites', error: String(error) });
  }
};

export const getFavorites = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        movie: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { movieId } = req.params;
    
    await prisma.favorite.deleteMany({
      where: {
        userId,
        movieId: parseInt(movieId)
      }
    });
    
    res.json({ message: 'Movie removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Failed to remove movie from favorites' });
  }
};

export const checkFavoriteStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('Check favorite status request received');
    
    const userId = req.user?.id;
    const tmdbId = parseInt(req.params.tmdbId);
    
    console.log(`Checking if movie ${tmdbId} is favorited by user ${userId}`);

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const movie = await prisma.movie.findUnique({
      where: { tmdbId }
    });

    if (!movie) {
      console.log(`Movie ${tmdbId} not found in database, not favorited`);
      return res.json({ isFavorited: false });
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId,
        movieId: movie.id
      }
    });

    const isFavorited = !!favorite;
    console.log(`Movie ${tmdbId} favorite status for user ${userId}: ${isFavorited}`);
    
    res.json({ isFavorited });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
};