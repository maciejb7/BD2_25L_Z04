import { Request, Response } from "express";
import { MoviesService } from "../services/movie.service";
import logger from "../logger";
import { handleRequest } from "../utils/handle-request";

/**
 * Get all movies with optional filtering
 * @param req Request
 * @param res Response
 */
export const getMovies = handleRequest(async (req: Request, res: Response) => {
  try {
    const { genre, year, search } = req.query;

    const movies = await MoviesService.getMovies({
      genre: genre as string,
      year: year ? parseInt(year as string) : undefined,
      search: search as string,
    });

    res.status(200).json({
      movies,
      count: movies.length,
    });
  } catch (error) {
    logger.error("Error getting movies", error);
    res.status(500).json({
      message: "Wystąpił błąd podczas pobierania filmów",
    });
  }
});

/**
 * Get movie details
 * @param req Request
 * @param res Response
 */
export const getMovieDetails = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const movieId = parseInt(req.params.movieId);

      if (isNaN(movieId)) {
        res.status(400).json({ message: "Invalid movie ID" });
        return;
      }

      const movieDetails = await MoviesService.getMovieDetails(movieId);

      if (!movieDetails) {
        res.status(404).json({
          message: "Film nie został znaleziony",
        });
        return;
      }

      res.status(200).json(movieDetails);
    } catch (error) {
      logger.error("Error getting movie details", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania szczegółów filmu",
      });
    }
  },
);

/**
 * Add a movie to user's list
 * @param req Request
 * @param res Response
 */
export const addUserMovie = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const { movieId, rating, is_favorite } = req.body;

      if (!movieId) {
        res.status(400).json({ message: "Movie ID is required" });
        return;
      }

      const userMovie = await MoviesService.addUserMovie(userId, {
        movieId: parseInt(movieId),
        rating: rating ? parseInt(rating) : undefined,
        is_favorite: is_favorite || false,
      });

      res.status(200).json({
        message: "Film został dodany do listy użytkownika",
        userMovie,
      });
    } catch (error) {
      logger.error("Error adding user movie", error);

      if (
        error instanceof Error &&
        error.message.includes("already in user's list")
      ) {
        res.status(409).json({
          message: "Ten film jest już na liście użytkownika",
        });
        return;
      }

      res.status(500).json({
        message: "Wystąpił błąd podczas dodawania filmu do listy",
      });
    }
  },
);

/**
 * Update user movie (rating, favorite status)
 * @param req Request
 * @param res Response
 */
export const updateUserMovie = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const movieId = parseInt(req.params.movieId);
      const { rating, is_favorite } = req.body;

      if (isNaN(movieId)) {
        res.status(400).json({ message: "Invalid movie ID" });
        return;
      }

      const updated = await MoviesService.updateUserMovie(userId, movieId, {
        rating: rating ? parseInt(rating) : undefined,
        is_favorite,
      });

      if (!updated) {
        res.status(404).json({
          message: "Film nie został znaleziony na liście użytkownika",
        });
        return;
      }

      res.status(200).json({
        message: "Film został zaktualizowany",
      });
    } catch (error) {
      logger.error("Error updating user movie", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas aktualizacji filmu",
      });
    }
  },
);

/**
 * Remove a movie from user's list
 * @param req Request
 * @param res Response
 */
export const removeUserMovie = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const movieId = parseInt(req.params.movieId);

      if (isNaN(movieId)) {
        res.status(400).json({ message: "Invalid movie ID" });
        return;
      }

      const removed = await MoviesService.removeUserMovie(userId, movieId);

      if (!removed) {
        res.status(404).json({
          message: "Film nie został znaleziony na liście użytkownika",
        });
        return;
      }

      res.status(200).json({
        message: "Film został usunięty z listy użytkownika",
      });
    } catch (error) {
      logger.error("Error removing user movie", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas usuwania filmu z listy",
      });
    }
  },
);

/**
 * Get user's movies
 * @param req Request
 * @param res Response
 */
export const getUserMovies = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;

      const userMovies = await MoviesService.getUserMovies(userId);

      res.status(200).json({
        movies: userMovies,
        count: userMovies.length,
      });
    } catch (error) {
      logger.error("Error getting user movies", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania filmów użytkownika",
      });
    }
  },
);

/**
 * Get user's favorite movies
 * @param req Request
 * @param res Response
 */
export const getUserFavoriteMovies = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;

      const favoriteMovies = await MoviesService.getUserFavoriteMovies(userId);

      res.status(200).json({
        favorites: favoriteMovies,
        count: favoriteMovies.length,
      });
    } catch (error) {
      logger.error("Error getting user favorite movies", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania ulubionych filmów",
      });
    }
  },
);

/**
 * Get all movie genres
 * @param req Request
 * @param res Response
 */
export const getMovieGenres = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const genres = await MoviesService.getMovieGenres();

      res.status(200).json({
        genres,
        count: genres.length,
      });
    } catch (error) {
      logger.error("Error getting movie genres", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania gatunków filmów",
      });
    }
  },
);

export const MoviesController = {
  getMovies,
  getMovieDetails,
  addUserMovie,
  updateUserMovie,
  removeUserMovie,
  getUserMovies,
  getUserFavoriteMovies,
  getMovieGenres,
};
