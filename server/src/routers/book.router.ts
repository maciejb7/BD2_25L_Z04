import { Router } from "express";
import { BooksController } from "../controllers/books.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const bookRouter = Router();

// PUBLIC ROUTES

bookRouter.get("/books", BooksController.getBooks);

bookRouter.get("/books/:bookId", BooksController.getBookDetails);

bookRouter.get("/authors", BooksController.getBookAuthors);

bookRouter.get("/genres", BooksController.getBookGenres);

// PROTECTED ROUTES

bookRouter.get(
  "/library",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserBooks,
);

bookRouter.get(
  "/library/user/:userId",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserBooks,
);

bookRouter.get(
  "/favorites",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserFavoriteBooks,
);

bookRouter.get(
  "/favorites/user/:userId",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserFavoriteBooks,
);

bookRouter.post(
  "/library",
  AuthMiddleware.authenticateUser(),
  BooksController.addUserBook,
);

bookRouter.put(
  "/library/:bookId",
  AuthMiddleware.authenticateUser(),
  BooksController.updateUserBook,
);

bookRouter.delete(
  "/library/:bookId",
  AuthMiddleware.authenticateUser(),
  BooksController.removeUserBook,
);

bookRouter.get(
  "/stats",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserReadingStats,
);

bookRouter.get(
  "/stats/user/:userId",
  AuthMiddleware.authenticateUser(),
  BooksController.getUserReadingStats,
);

export default bookRouter;
