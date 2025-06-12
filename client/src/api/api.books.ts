import api, { handleApiError } from "./api";

export interface BookAuthor {
  id: number;
  author_name: string;
  author_biography?: string;
  author_birth_year?: number;
  author_nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: number;
  book_title: string;
  book_description?: string;
  book_isbn?: string;
  publication_year?: number;
  book_genre?: string;
  book_pages?: number;
  book_language?: string;
  book_author_id: number;
  createdAt: string;
  updatedAt: string;
  author: BookAuthor;
}

export interface UserBook {
  id: number;
  user_id: string;
  book_id: number;
  rating?: number;
  is_favorite: boolean;
  reading_status: "to_read" | "reading" | "finished" | "abandoned";
  current_page?: number;
  notes?: string;
  started_reading_at?: string;
  finished_reading_at?: string;
  createdAt: string;
  updatedAt: string;
  book: Book;
}

export interface BooksFilter {
  genre?: string;
  author?: string;
  year?: number;
  search?: string;
}

export interface AddUserBookData {
  bookId: number;
  rating?: number;
  is_favorite?: boolean;
  reading_status?: "to_read" | "reading" | "finished" | "abandoned";
  current_page?: number;
  notes?: string;
  started_reading_at?: Date;
  finished_reading_at?: Date;
}

export interface UpdateUserBookData {
  rating?: number;
  is_favorite?: boolean;
  reading_status?: "to_read" | "reading" | "finished" | "abandoned";
  current_page?: number;
  notes?: string;
  started_reading_at?: Date;
  finished_reading_at?: Date;
}

export interface ReadingStats {
  totalBooks: number;
  finishedBooks: number;
  currentlyReading: number;
  toRead: number;
  abandoned: number;
  averageRating: number;
}

// Public routes
export const getBooks = async (filters?: BooksFilter): Promise<Book[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.author) params.append('author', filters.author);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/api/books/books?${queryString}` : '/api/books/books';

    const response = await api.get<{books: Book[], count: number}>(url);

    return response.data.books;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania książek. Spróbuj ponownie.",
    );
  }
};

export const getBookDetails = async (bookId: number): Promise<Book> => {
  try {
    const response = await api.get<Book>(`/api/books/${bookId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania szczegółów książki. Spróbuj ponownie.",
    );
  }
};

export const getBookAuthors = async (): Promise<BookAuthor[]> => {
  try {
    const response = await api.get<BookAuthor[]>('/api/books/authors');
    return response.data.authors;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania autorów. Spróbuj ponownie.",
    );
  }
};

export const getBookGenres = async (): Promise<string[]> => {
  try {
    const response = await api.get<string[]>('/api/books/genres');
    return response.data.genres;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania gatunków książek. Spróbuj ponownie.",
    );
  }
};

// Protected routes
export const getUserBooks = async (userId?: string): Promise<UserBook[]> => {
  try {
    const url = userId ? `/api/library/user/${userId}` : '/api/books/library';
    const response = await api.get<UserBook[]>(url);
    return response.data.books;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania biblioteki użytkownika. Spróbuj ponownie.",
    );
  }
};

export const getUserFavoriteBooks = async (userId?: string): Promise<UserBook[]> => {
  try {
    const url = userId ? `/api/favorites/user/${userId}` : '/api/books/favorites';
    const response = await api.get<UserBook[]>(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania ulubionych książek. Spróbuj ponownie.",
    );
  }
};

export const addUserBook = async (data: AddUserBookData): Promise<UserBook> => {
  try {
    const response = await api.post<UserBook>('/api/books/library', data);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas dodawania książki do biblioteki. Spróbuj ponownie.",
    );
  }
};

export const updateUserBook = async (bookId: number, data: UpdateUserBookData): Promise<any> => {
  try {
    const response = await api.put(`/api/books/library/${bookId}`, data);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas aktualizacji książki. Spróbuj ponownie.",
    );
  }
};

export const removeUserBook = async (bookId: number): Promise<any> => {
  try {
    const response = await api.delete(`/api/books/library/${bookId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania książki z biblioteki. Spróbuj ponownie.",
    );
  }
};

export const getUserReadingStats = async (userId?: string): Promise<ReadingStats> => {
  try {
    const url = userId ? `/api/books/stats/user/${userId}` : '/api/books/stats';
    const response = await api.get<ReadingStats>(url);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania statystyk czytania. Spróbuj ponownie.",
    );
  }
};