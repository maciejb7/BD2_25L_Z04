import { Request, Response } from "express";
import { BooksService } from "../services/book.service";
import logger from "../logger";
import { handleRequest } from "../utils/handle-request";

/**
 * Get all books with optional filtering
 * @param req Request
 * @param res Response
 */
export const getBooks = handleRequest(async (req: Request, res: Response) => {
  try {
    const { genre, author, search, year } = req.query;

    const books = await BooksService.getBooks({
      genre: genre as string,
      author: author as string,
      search: search as string,
      year: year ? parseInt(year as string) : undefined,
    });

    res.status(200).json({
      books,
      count: books.length,
    });
  } catch (error) {
    logger.error("Error getting books", error);
    res.status(500).json({
      message: "Wystąpił błąd podczas pobierania książek",
    });
  }
});

/**
 * Get book details
 * @param req Request
 * @param res Response
 */
export const getBookDetails = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.bookId);

      if (isNaN(bookId)) {
        res.status(400).json({ message: "Invalid book ID" });
        return;
      }

      const bookDetails = await BooksService.getBookDetails(bookId);

      if (!bookDetails) {
        res.status(404).json({
          message: "Książka nie została znaleziona",
        });
        return;
      }

      res.status(200).json(bookDetails);
    } catch (error) {
      logger.error("Error getting book details", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania szczegółów książki",
      });
    }
  },
);

/**
 * Add a book to user's library
 * @param req Request
 * @param res Response
 */
export const addUserBook = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const {
        bookId,
        rating,
        is_favorite,
        reading_status,
        current_page,
        notes,
      } = req.body;

      if (!bookId) {
        res.status(400).json({ message: "Book ID is required" });
        return;
      }

      const userBook = await BooksService.addUserBook(userId, {
        bookId: parseInt(bookId),
        rating: rating ? parseInt(rating) : undefined,
        is_favorite: is_favorite || false,
        reading_status: reading_status || "to_read",
        current_page: current_page ? parseInt(current_page) : undefined,
        notes,
      });

      res.status(200).json({
        message: "Książka została dodana do biblioteki użytkownika",
        userBook,
      });
    } catch (error) {
      logger.error("Error adding user book", error);

      if (
        error instanceof Error &&
        error.message.includes("already in user's library")
      ) {
        res.status(409).json({
          message: "Ta książka jest już w bibliotece użytkownika",
        });
        return;
      }

      res.status(500).json({
        message: "Wystąpił błąd podczas dodawania książki do biblioteki",
      });
    }
  },
);

/**
 * Update user book (rating, reading status, progress, etc.)
 * @param req Request
 * @param res Response
 */
export const updateUserBook = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const bookId = parseInt(req.params.bookId);
      const { rating, is_favorite, reading_status, current_page, notes } =
        req.body;

      if (isNaN(bookId)) {
        res.status(400).json({ message: "Invalid book ID" });
        return;
      }

      const updated = await BooksService.updateUserBook(userId, bookId, {
        rating: rating ? parseInt(rating) : undefined,
        is_favorite,
        reading_status,
        current_page: current_page ? parseInt(current_page) : undefined,
        notes,
      });

      if (!updated) {
        res.status(404).json({
          message: "Książka nie została znaleziona w bibliotece użytkownika",
        });
        return;
      }

      res.status(200).json({
        message: "Książka została zaktualizowana",
      });
    } catch (error) {
      logger.error("Error updating user book", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas aktualizacji książki",
      });
    }
  },
);

/**
 * Remove a book from user's library
 * @param req Request
 * @param res Response
 */
export const removeUserBook = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const bookId = parseInt(req.params.bookId);

      if (isNaN(bookId)) {
        res.status(400).json({ message: "Invalid book ID" });
        return;
      }

      const removed = await BooksService.removeUserBook(userId, bookId);

      if (!removed) {
        res.status(404).json({
          message: "Książka nie została znaleziona w bibliotece użytkownika",
        });
        return;
      }

      res.status(200).json({
        message: "Książka została usunięta z biblioteki użytkownika",
      });
    } catch (error) {
      logger.error("Error removing user book", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas usuwania książki z biblioteki",
      });
    }
  },
);

/**
 * Get user's books
 * @param req Request
 * @param res Response
 */
export const getUserBooks = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;
      const { reading_status } = req.query;

      const userBooks = await BooksService.getUserBooks(
        userId,
        reading_status as
          | "to_read"
          | "reading"
          | "finished"
          | "abandoned"
          | undefined,
      );

      res.status(200).json({
        books: userBooks,
        count: userBooks.length,
      });
    } catch (error) {
      logger.error("Error getting user books", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania książek użytkownika",
      });
    }
  },
);

/**
 * Get user's favorite books
 * @param req Request
 * @param res Response
 */
export const getUserFavoriteBooks = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;

      const favoriteBooks = await BooksService.getUserFavoriteBooks(userId);

      res.status(200).json({
        favorites: favoriteBooks,
        count: favoriteBooks.length,
      });
    } catch (error) {
      logger.error("Error getting user favorite books", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania ulubionych książek",
      });
    }
  },
);

/**
 * Get user's reading statistics
 * @param req Request
 * @param res Response
 */
export const getUserReadingStats = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;

      const stats = await BooksService.getUserReadingStats(userId);

      res.status(200).json(stats);
    } catch (error) {
      logger.error("Error getting user reading stats", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania statystyk czytania",
      });
    }
  },
);

/**
 * Get all book authors
 * @param req Request
 * @param res Response
 */
export const getBookAuthors = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const authors = await BooksService.getBookAuthors();

      res.status(200).json({
        authors,
        count: authors.length,
      });
    } catch (error) {
      logger.error("Error getting book authors", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania autorów książek",
      });
    }
  },
);

/**
 * Get all book genres
 * @param req Request
 * @param res Response
 */
export const getBookGenres = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const genres = await BooksService.getBookGenres();

      res.status(200).json({
        genres,
        count: genres.length,
      });
    } catch (error) {
      logger.error("Error getting book genres", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania gatunków książek",
      });
    }
  },
);

export const BooksController = {
  getBooks,
  getBookDetails,
  addUserBook,
  updateUserBook,
  removeUserBook,
  getUserBooks,
  getUserFavoriteBooks,
  getUserReadingStats,
  getBookAuthors,
  getBookGenres,
};
