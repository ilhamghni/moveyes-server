import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'; // Gunakan shared instance
import * as tmdbService from '../services/tmdb.service';

export const updateWatchProgress = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { tmdbId, progress } = req.body;
    
    if (progress === undefined || typeof progress !== 'number') {
      return res.status(400).json({ message: 'Progress must be provided as a number' });
    }
    
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
    
    const watchHistoryEntry = await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId: movie.id
        }
      },
      update: {
        progress,
        watchedAt: new Date()
      },
      create: {
        userId,
        movieId: movie.id,
        progress,
        watchedAt: new Date()
      },
      include: {
        movie: true
      }
    });
    
    res.json(watchHistoryEntry);
  } catch (error) {
    console.error('Error updating watch progress:', error);
    res.status(500).json({ message: 'Failed to update watch progress' });
  }
};

export const getWatchHistory = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const watchHistory = await prisma.watchHistory.findMany({
      where: { userId },
      include: {
        movie: true
      },
      orderBy: { watchedAt: 'desc' }
    });
    
    res.json(watchHistory);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    res.status(500).json({ message: 'Failed to fetch watch history' });
  }
};