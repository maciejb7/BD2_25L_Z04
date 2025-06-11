import { Router } from "express";
import { MoviesController } from "../controllers/movies.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const moviesRouter = Router();

// PROTECTED ROUTES

moviesRouter.get(
  "/",
  AuthMiddleware.authenticateUser(),
  MoviesController.getMovies,
);

moviesRouter.get(
  "/:movieId",
  AuthMiddleware.authenticateUser(),
  MoviesController.getMovieDetails,
);

moviesRouter.get(
  "/genres/all",
  AuthMiddleware.authenticateUser(),
  MoviesController.getMovieGenres,
);

moviesRouter.get(
  "/user/:userId",
  AuthMiddleware.authenticateUser(),
  MoviesController.getUserMovies,
);

moviesRouter.get(
  "/user/me/list",
  AuthMiddleware.authenticateUser(),
  MoviesController.getUserMovies,
);

moviesRouter.get(
  "/favorites/user/:userId",
  AuthMiddleware.authenticateUser(),
  MoviesController.getUserFavoriteMovies,
);

moviesRouter.get(
  "/favorites/me",
  AuthMiddleware.authenticateUser(),
  MoviesController.getUserFavoriteMovies,
);

moviesRouter.post(
  "/user/add",
  AuthMiddleware.authenticateUser(),
  MoviesController.addUserMovie,
);

moviesRouter.put(
  "/user/:movieId",
  AuthMiddleware.authenticateUser(),
  MoviesController.updateUserMovie,
);

moviesRouter.delete(
  "/user/:movieId",
  AuthMiddleware.authenticateUser(),
  MoviesController.removeUserMovie,
);

export default moviesRouter;
