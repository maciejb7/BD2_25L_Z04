import api, { handleApiError } from "./api";

export interface MovieGenre {
  id: number;
  movie_genre_name: string;
  movie_genre_description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: number;
  movie_name: string;
  movie_description?: string;
  movie_release_year?: number;
  movie_duration?: number;
  movie_rating?: number;
  movie_director?: string;
  movie_genre_id: number;
  createdAt: string;
  updatedAt: string;
  genre: MovieGenre;
}

export interface UserMovie {
  id: string;
  user_id: string;
  movie_id: number;
  rating?: number;
  is_favorite: boolean;
  createdAt: string;
  updatedAt: string;
  movie: Movie;
}

export interface MoviesFilter {
  genre?: string;
  year?: number;
  search?: string;
}

export interface AddUserMovieData {
  movieId: number;
  rating?: number;
  is_favorite?: boolean;
}

export interface UpdateUserMovieData {
  rating?: number;
  is_favorite?: boolean;
}

// Protected routes (all movie routes are protected)
export const getMovies = async (filters?: MoviesFilter): Promise<Movie[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/movies?${queryString}` : '/api/movies';

    const response = await api.get<Movie[]>(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania filmów. Spróbuj ponownie.",
    );
  }
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  try {
    const response = await api.get<Movie>(`/api/movies/${movieId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania szczegółów filmu. Spróbuj ponownie.",
    );
  }
};

export const getMovieGenres = async (): Promise<MovieGenre[]> => {
  try {
    const response = await api.get<MovieGenre[]>('/api/movies/genres/all');
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania gatunków filmów. Spróbuj ponownie.",
    );
  }
};

export const getUserMovies = async (userId?: string): Promise<UserMovie[]> => {
  try {
    const url = userId ? `/api/movies/user/${userId}` : '/api/movies/user/me/list';
    const response = await api.get<UserMovie[]>(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania filmów użytkownika. Spróbuj ponownie.",
    );
  }
};

export const getUserFavoriteMovies = async (userId?: string): Promise<UserMovie[]> => {
  try {
    const url = userId ? `/api/movies/favorites/user/${userId}` : '/api/movies/favorites/me';
    const response = await api.get<UserMovie[]>(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania ulubionych filmów. Spróbuj ponownie.",
    );
  }
};

export const addUserMovie = async (data: AddUserMovieData): Promise<UserMovie> => {
  try {
    const response = await api.post<UserMovie>('/api/movies/user/add', data);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas dodawania filmu do listy. Spróbuj ponownie.",
    );
  }
};

export const updateUserMovie = async (movieId: number, data: UpdateUserMovieData): Promise<any> => {
  try {
    const response = await api.put(`/api/movies/user/${movieId}`, data);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas aktualizacji filmu. Spróbuj ponownie.",
    );
  }
};

export const removeUserMovie = async (movieId: number): Promise<any> => {
  try {
    const response = await api.delete(`/api/movies/user/${movieId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania filmu z listy. Spróbuj ponownie.",
    );
  }
};