import { Request, Response } from "express";
import { MusicService } from "../services/music.service";
import logger from "../logger";

/**
 * Controller for handling music-related requests.
 */
export class MusicController {
  /**
   * Search for tracks by name
   * @param req Request
   * @param res Response
   */
  static async searchTracks(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;

      if (!query || query.trim().length === 0) {
        res.status(400).json({ message: "Search query is required" });
        return;
      }

      const results = await MusicService.searchTracks(query.trim());

      res.status(200).json({
        results,
        count: results.length,
      });
    } catch (error) {
      logger.error("Error searching for tracks", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas wyszukiwania utworów",
      });
    }
  }

  /**
   * Add a track to user's favorites
   * @param req Request
   * @param res Response
   */
  static async addFavoriteTrack(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as { userId: string };
      const { trackData } = req.body;

      if (!trackData) {
        res.status(400).json({ message: "Track data is required" });
        return;
      }

      // First save the track to our database
      const savedTrack = await MusicService.saveTrack(trackData);

      // Then add it to user's favorites
      await MusicService.addFavoriteTrack(userId, savedTrack.music_track_id);

      res.status(200).json({
        message: "Utwór został dodany do ulubionych",
        track: savedTrack,
      });
    } catch (error) {
      logger.error("Error adding favorite track", error);

      // Check if the error is due to track already being in favorites
      if (
        error instanceof Error &&
        error.message.includes("already in user's favorites")
      ) {
        res.status(409).json({
          message: "Ten utwór jest już w ulubionych",
        });
        return;
      }

      res.status(500).json({
        message: "Wystąpił błąd podczas dodawania utworu do ulubionych",
      });
    }
  }

  /**
   * Remove a track from user's favorites
   * @param req Request
   * @param res Response
   */
  static async removeFavoriteTrack(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as { userId: string };
      const trackId = parseInt(req.params.trackId);

      if (isNaN(trackId)) {
        res.status(400).json({ message: "Invalid track ID" });
        return;
      }

      const removed = await MusicService.removeFavoriteTrack(userId, trackId);

      if (!removed) {
        res.status(404).json({
          message: "Utwór nie został znaleziony w ulubionych",
        });
        return;
      }

      res.status(200).json({
        message: "Utwór został usunięty z ulubionych",
      });
    } catch (error) {
      logger.error("Error removing favorite track", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas usuwania utworu z ulubionych",
      });
    }
  }

  /**
   * Get user's favorite tracks
   * @param req Request
   * @param res Response
   */
  static async getUserFavoriteTracks(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const userId =
        req.params.userId || (req.user as { userId: string }).userId;

      const favorites = await MusicService.getUserFavoriteTracks(userId);

      res.status(200).json({
        favorites,
        count: favorites.length,
      });
    } catch (error) {
      logger.error("Error getting favorite tracks", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania ulubionych utworów",
      });
    }
  }

  /**
   * Get track details
   * @param req Request
   * @param res Response
   */
  static async getTrackDetails(req: Request, res: Response): Promise<void> {
    try {
      const trackId = parseInt(req.params.trackId);

      if (isNaN(trackId)) {
        res.status(400).json({ message: "Invalid track ID" });
        return;
      }

      const trackDetails = await MusicService.getTrackDetails(trackId);

      if (!trackDetails) {
        res.status(404).json({
          message: "Utwór nie został znaleziony",
        });
        return;
      }

      res.status(200).json(trackDetails);
    } catch (error) {
      logger.error("Error getting track details", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania szczegółów utworu",
      });
    }
  }
}
