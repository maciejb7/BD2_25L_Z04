import { Book, books } from "../db/models/book";
import { BookAuthor, bookAuthors } from "../db/models/book_author";
import { UserBook } from "../db/models/user_books";
import { Op } from "sequelize";
import { database } from "../db/database";
import logger from "../logger";

interface BooksFilter {
  genre?: string;
  author?: string;
  year?: number;
  search?: string;
}

interface AddUserBookData {
  bookId: number;
  rating?: number;
  is_favorite?: boolean;
  reading_status?: "to_read" | "reading" | "finished" | "abandoned";
  current_page?: number;
  notes?: string;
  started_reading_at?: Date;
  finished_reading_at?: Date;
}

interface UpdateUserBookData {
  rating?: number;
  is_favorite?: boolean;
  reading_status?: "to_read" | "reading" | "finished" | "abandoned";
  current_page?: number;
  notes?: string;
  started_reading_at?: Date;
  finished_reading_at?: Date;
}

const initializeBookData = async (): Promise<void> => {
  const transaction = await database.transaction();
  try {
    // Check if authors exist, if not create them
    const authorCount = await BookAuthor.count();
    if (authorCount === 0) {
      logger.info("Initializing book authors data");
      await BookAuthor.bulkCreate(bookAuthors, { transaction });
    }

    // Check if books exist, if not create them
    const bookCount = await Book.count();
    if (bookCount === 0) {
      logger.info("Initializing books data");
      await Book.bulkCreate(books, { transaction });
    }

    await transaction.commit();
    logger.info("Book data initialized successfully");
  } catch (error) {
    await transaction.rollback();
    logger.error("Error initializing book data", error);
    throw error;
  }
};

/**
 * Get books with optional filtering
 * @param filters Filtering options
 * @returns Promise with books array
 */
const getBooks = async (filters: BooksFilter = {}): Promise<Book[]> => {
  try {
    const where: any = {};
    const include: any[] = [
      {
        model: BookAuthor,
        as: "author",
      },
    ];

    if (filters.search) {
      where[Op.or] = [
        {
          book_title: {
            [Op.iLike]: `%${filters.search}%`,
          },
        },
        {
          book_description: {
            [Op.iLike]: `%${filters.search}%`,
          },
        },
      ];
    }

    if (filters.year) {
      where.publication_year = filters.year;
    }

    if (filters.genre) {
      where.book_genre = {
        [Op.iLike]: `%${filters.genre}%`,
      };
    }

    if (filters.author) {
      include[0].where = {
        author_name: {
          [Op.iLike]: `%${filters.author}%`,
        },
      };
    }

    const books = await Book.findAll({
      where,
      include,
      order: [["publication_year", "DESC"]],
    });

    return books;
  } catch (error) {
    logger.error("Error getting books", error);
    throw error;
  }
};

/**
 * Get book details by ID
 * @param bookId Book ID
 * @returns Promise with book details or null
 */
const getBookDetails = async (bookId: number): Promise<Book | null> => {
  try {
    const book = await Book.findByPk(bookId, {
      include: [
        {
          model: BookAuthor,
          as: "author",
        },
      ],
    });

    return book;
  } catch (error) {
    logger.error("Error getting book details", error);
    throw error;
  }
};

/**
 * Add book to user's library
 * @param userId User ID
 * @param data Book data
 * @returns Promise with created UserBook entry
 */
const addUserBook = async (
  userId: string,
  data: AddUserBookData,
): Promise<UserBook> => {
  const transaction = await database.transaction();

  try {
    const book = await Book.findByPk(data.bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    const existingUserBook = await UserBook.findOne({
      where: {
        user_id: userId,
        book_id: data.bookId,
      },
    });

    if (existingUserBook) {
      throw new Error("Book is already in user's library");
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    if (data.current_page !== undefined && data.current_page < 0) {
      throw new Error("Current page must be non-negative");
    }

    const userBook = await UserBook.create(
      {
        user_id: userId,
        book_id: data.bookId,
        rating: data.rating,
        is_favorite: data.is_favorite || false,
        reading_status: data.reading_status || "to_read",
        current_page: data.current_page,
        notes: data.notes,
        started_reading_at: data.started_reading_at,
        finished_reading_at: data.finished_reading_at,
      },
      { transaction },
    );

    await transaction.commit();
    return userBook;
  } catch (error) {
    await transaction.rollback();
    logger.error("Error adding user book", error);
    throw error;
  }
};

/**
 * Update user book
 * @param userId User ID
 * @param bookId Book ID
 * @param data Update data
 * @returns Promise<boolean> True if updated
 */
const updateUserBook = async (
  userId: string,
  bookId: number,
  data: UpdateUserBookData,
): Promise<boolean> => {
  try {
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    if (data.current_page !== undefined && data.current_page < 0) {
      throw new Error("Current page must be non-negative");
    }

    const [updatedCount] = await UserBook.update(data, {
      where: {
        user_id: userId,
        book_id: bookId,
      },
    });

    return updatedCount > 0;
  } catch (error) {
    logger.error("Error updating user book", error);
    throw error;
  }
};

/**
 * Remove book from user's library
 * @param userId User ID
 * @param bookId Book ID
 * @returns Promise<boolean> True if removed
 */
const removeUserBook = async (
  userId: string,
  bookId: number,
): Promise<boolean> => {
  try {
    const deleted = await UserBook.destroy({
      where: {
        user_id: userId,
        book_id: bookId,
      },
    });

    return deleted > 0;
  } catch (error) {
    logger.error("Error removing user book", error);
    throw error;
  }
};

/**
 * Get user's books
 * @param userId User ID
 * @param status Optional reading status filter
 * @returns Promise with user's books
 */
const getUserBooks = async (
  userId: string,
  status?: "to_read" | "reading" | "finished" | "abandoned",
): Promise<Array<{ userBook: UserBook; book: Book; author: BookAuthor }>> => {
  try {
    const where: Record<string, unknown> = { user_id: userId };

    if (status) {
      where.reading_status = status;
    }

    const userBooks = await UserBook.findAll({
      where,
      include: [
        {
          model: Book,
          include: [
            {
              model: BookAuthor,
              as: "author",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return userBooks.map((userBook) => ({
      userBook,
      book: userBook.book,
      author: userBook.book.author,
    }));
  } catch (error) {
    logger.error("Error getting user books", error);
    throw error;
  }
};

/**
 * Get user's favorite books
 * @param userId User ID
 * @returns Promise with user's favorite books
 */
const getUserFavoriteBooks = async (
  userId: string,
): Promise<Array<{ userBook: UserBook; book: Book; author: BookAuthor }>> => {
  try {
    const favoriteBooks = await UserBook.findAll({
      where: {
        user_id: userId,
        is_favorite: true,
      },
      include: [
        {
          model: Book,
          include: [
            {
              model: BookAuthor,
              as: "author",
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return favoriteBooks.map((userBook) => ({
      userBook,
      book: userBook.book,
      author: userBook.book.author,
    }));
  } catch (error) {
    logger.error("Error getting user favorite books", error);
    throw error;
  }
};

/**
 * Get all book authors
 * @returns Promise with all book authors
 */
const getBookAuthors = async (): Promise<BookAuthor[]> => {
  try {
    const authors = await BookAuthor.findAll({
      order: [["author_name", "ASC"]],
    });

    return authors;
  } catch (error) {
    logger.error("Error getting book authors", error);
    throw error;
  }
};

/**
 * Get all unique book genres
 * @returns Promise with all book genres
 */
const getBookGenres = async (): Promise<string[]> => {
  try {
    const genres = await Book.findAll({
      attributes: ["book_genre"],
      where: {
        book_genre: {
          [Op.not]: null,
        },
      },
      group: ["book_genre"],
      order: [["book_genre", "ASC"]],
    });

    return genres.map((book) => book.book_genre).filter(Boolean);
  } catch (error) {
    logger.error("Error getting book genres", error);
    throw error;
  }
};

/**
 * Get user's reading statistics
 * @param userId User ID
 * @returns Promise with reading statistics
 */
const getUserReadingStats = async (
  userId: string,
): Promise<{
  totalBooks: number;
  finishedBooks: number;
  currentlyReading: number;
  toRead: number;
  abandoned: number;
  averageRating: number;
}> => {
  try {
    const userBooks = await UserBook.findAll({
      where: { user_id: userId },
    });

    const stats = {
      totalBooks: userBooks.length,
      finishedBooks: userBooks.filter(
        (book) => book.reading_status === "finished",
      ).length,
      currentlyReading: userBooks.filter(
        (book) => book.reading_status === "reading",
      ).length,
      toRead: userBooks.filter((book) => book.reading_status === "to_read")
        .length,
      abandoned: userBooks.filter((book) => book.reading_status === "abandoned")
        .length,
      averageRating: 0,
    };

    const ratedBooks = userBooks.filter((book) => book.rating !== null);
    if (ratedBooks.length > 0) {
      const totalRating = ratedBooks.reduce(
        (sum, book) => sum + (book.rating || 0),
        0,
      );
      stats.averageRating = Number(
        (totalRating / ratedBooks.length).toFixed(2),
      );
    }

    return stats;
  } catch (error) {
    logger.error("Error getting user reading stats", error);
    throw error;
  }
};

export const BooksService = {
  getBooks,
  getBookDetails,
  addUserBook,
  updateUserBook,
  removeUserBook,
  getUserBooks,
  getUserFavoriteBooks,
  getBookAuthors,
  getBookGenres,
  getUserReadingStats,
  initializeBookData,
};
