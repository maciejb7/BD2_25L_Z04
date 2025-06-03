import { Router } from "express";
import { MusicController } from "../controllers/music.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const musicRouter = Router();

// PROTECTED ROUTES

// Search for tracks
musicRouter.get("/search", authenticateUser(), MusicController.searchTracks);

// Get track details
musicRouter.get(
  "/tracks/:trackId",
  authenticateUser(),
  MusicController.getTrackDetails,
);

// Get user's favorite tracks
musicRouter.get(
  "/favorites/user/:userId",
  authenticateUser(),
  MusicController.getUserFavoriteTracks,
);

// Get current user's favorite tracks
musicRouter.get(
  "/favorites",
  authenticateUser(),
  MusicController.getUserFavoriteTracks,
);

// Add a track to favorites
musicRouter.post(
  "/favorites",
  authenticateUser(),
  MusicController.addFavoriteTrack,
);

// Remove a track from favorites
musicRouter.delete(
  "/favorites/:trackId",
  authenticateUser(),
  MusicController.removeFavoriteTrack,
);

export default musicRouter;
