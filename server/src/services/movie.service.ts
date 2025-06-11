import { Movie } from "../db/models/movies";
import { MovieGenre } from "../db/models/movie_genre";
import { UserMovie } from "../db/models/user_movie";
import { Op } from "sequelize";
import { database } from "../db/database";
import logger from "../logger";

interface MoviesFilter {
  genre?: string;
  year?: number;
  search?: string;
}

interface AddUserMovieData {
  movieId: number;
  rating?: number;
  is_favorite?: boolean;
}

interface UpdateUserMovieData {
  rating?: number;
  is_favorite?: boolean;
}

/**
 * Get movies with optional filtering
 * @param filters Filtering options
 * @returns Promise with movies array
 */
const getMovies = async (filters: MoviesFilter = {}): Promise<Movie[]> => {
  try {
    // Build where clause and include options based on filters
    // this any here is used intentionally to allow dynamic filtering
    const where: any = {};
    const include: any[] = [
      {
        model: MovieGenre,
        as: "genre",
      },
    ];

    if (filters.search) {
      where.movie_name = {
        [Op.iLike]: `%${filters.search}%`,
      };
    }

    if (filters.year) {
      where.movie_release_year = filters.year;
    }

    if (filters.genre) {
      include[0].where = {
        movie_genre_name: {
          [Op.iLike]: `%${filters.genre}%`,
        },
      };
    }

    const movies = await Movie.findAll({
      where,
      include,
      order: [["movie_release_year", "DESC"]],
    });

    return movies;
  } catch (error) {
    logger.error("Error getting movies", error);
    throw error;
  }
};

/**
 * Get movie details by ID
 * @param movieId Movie ID
 * @returns Promise with movie details or null
 */
const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const movie = await Movie.findByPk(movieId, {
      include: [
        {
          model: MovieGenre,
          as: "genre",
        },
      ],
    });

    return movie;
  } catch (error) {
    logger.error("Error getting movie details", error);
    throw error;
  }
};

/**
 * Add movie to user's list
 * @param userId User ID
 * @param data Movie data
 * @returns Promise with created UserMovie entry
 */
const addUserMovie = async (
  userId: string,
  data: AddUserMovieData,
): Promise<UserMovie> => {
  const transaction = await database.transaction();

  try {
    // Check if movie exists
    const movie = await Movie.findByPk(data.movieId);
    if (!movie) {
      throw new Error("Movie not found");
    }

    const existingUserMovie = await UserMovie.findOne({
      where: {
        user_id: userId,
        movie_id: data.movieId,
      },
    });

    if (existingUserMovie) {
      throw new Error("Movie is already in user's list");
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const userMovie = await UserMovie.create(
      {
        user_id: userId,
        movie_id: data.movieId,
        rating: data.rating,
        is_favorite: data.is_favorite || false,
      },
      { transaction },
    );

    await transaction.commit();
    return userMovie;
  } catch (error) {
    await transaction.rollback();
    logger.error("Error adding user movie", error);
    throw error;
  }
};

/**
 * Update user movie
 * @param userId User ID
 * @param movieId Movie ID
 * @param data Update data
 * @returns Promise<boolean> True if updated
 */
const updateUserMovie = async (
  userId: string,
  movieId: number,
  data: UpdateUserMovieData,
): Promise<boolean> => {
  try {
    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const [updatedCount] = await UserMovie.update(data, {
      where: {
        user_id: userId,
        movie_id: movieId,
      },
    });

    return updatedCount > 0;
  } catch (error) {
    logger.error("Error updating user movie", error);
    throw error;
  }
};

/**
 * Remove movie from user's list
 * @param userId User ID
 * @param movieId Movie ID
 * @returns Promise<boolean> True if removed
 */
const removeUserMovie = async (
  userId: string,
  movieId: number,
): Promise<boolean> => {
  try {
    const deleted = await UserMovie.destroy({
      where: {
        user_id: userId,
        movie_id: movieId,
      },
    });

    return deleted > 0;
  } catch (error) {
    logger.error("Error removing user movie", error);
    throw error;
  }
};

/**
 * Get user's movies
 * @param userId User ID
 * @returns Promise with user's movies
 */
const getUserMovies = async (
  userId: string,
): Promise<
  Array<{ userMovie: UserMovie; movie: Movie; genre: MovieGenre }>
> => {
  try {
    const userMovies = await UserMovie.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Movie,
          include: [
            {
              model: MovieGenre,
              as: "genre",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return userMovies.map((userMovie) => ({
      userMovie,
      movie: userMovie.movie,
      genre: userMovie.movie.genre,
    }));
  } catch (error) {
    logger.error("Error getting user movies", error);
    throw error;
  }
};

/**
 * Get user's favorite movies
 * @param userId User ID
 * @returns Promise with user's favorite movies
 */
const getUserFavoriteMovies = async (
  userId: string,
): Promise<
  Array<{ userMovie: UserMovie; movie: Movie; genre: MovieGenre }>
> => {
  try {
    const favoriteMovies = await UserMovie.findAll({
      where: {
        user_id: userId,
        is_favorite: true,
      },
      include: [
        {
          model: Movie,
          include: [
            {
              model: MovieGenre,
              as: "genre",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return favoriteMovies.map((userMovie) => ({
      userMovie,
      movie: userMovie.movie,
      genre: userMovie.movie.genre,
    }));
  } catch (error) {
    logger.error("Error getting user favorite movies", error);
    throw error;
  }
};

/**
 * Get all movie genres
 * @returns Promise with all movie genres
 */
const getMovieGenres = async (): Promise<MovieGenre[]> => {
  try {
    const genres = await MovieGenre.findAll({
      order: [["movie_genre_name", "ASC"]],
    });

    return genres;
  } catch (error) {
    logger.error("Error getting movie genres", error);
    throw error;
  }
};

export const MoviesService = {
  getMovies,
  getMovieDetails,
  addUserMovie,
  updateUserMovie,
  removeUserMovie,
  getUserMovies,
  getUserFavoriteMovies,
  getMovieGenres,
};
