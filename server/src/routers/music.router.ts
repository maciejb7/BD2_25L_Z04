import { Router } from "express";
import { MusicController } from "../controllers/music.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const musicRouter = Router();

// PROTECTED ROUTES

// Search for tracks
musicRouter.get(
  "/search",
  AuthMiddleware.authenticateUser(),
  MusicController.searchTracks,
);

// Get track details
musicRouter.get(
  "/tracks/:trackId",
  AuthMiddleware.authenticateUser(),
  MusicController.getTrackDetails,
);

// Get user's favorite tracks
musicRouter.get(
  "/favorites/user/:userId",
  AuthMiddleware.authenticateUser(),
  MusicController.getUserFavoriteTracks,
);

// Get current user's favorite tracks
musicRouter.get(
  "/favorites",
  AuthMiddleware.authenticateUser(),
  MusicController.getUserFavoriteTracks,
);

// Add a track to favorites
musicRouter.post(
  "/favorites",
  AuthMiddleware.authenticateUser(),
  MusicController.addFavoriteTrack,
);

// Remove a track from favorites
musicRouter.delete(
  "/favorites/:trackId",
  AuthMiddleware.authenticateUser(),
  MusicController.removeFavoriteTrack,
);

export default musicRouter;
