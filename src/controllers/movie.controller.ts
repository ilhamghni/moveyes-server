import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as tmdbService from '../services/tmdb.service';

const prisma = new PrismaClient();

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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { tmdbId, title, posterPath } = req.body;
    
    let movie = await prisma.movie.findUnique({
      where: { tmdbId }
    });
    
    if (!movie) {
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
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Failed to add movie to favorites' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
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

export const removeFromFavorites = async (req: Request, res: Response) => {
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