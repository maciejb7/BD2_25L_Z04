import { Request, Response } from "express";
import { LocationService } from "../services/location.service";
import logger from "../logger";
import { handleRequest } from "../utils/handle-request";

/**
 * Set or update the current user's location
 * @param req Request
 * @param res Response
 */
export const setLocation = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const { latitude, longitude, address } = req.body;

      // Validate inputs
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        res
          .status(400)
          .json({ message: "Latitude and longitude must be numbers" });
        return;
      }

      // Validate latitude and longitude ranges
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        res
          .status(400)
          .json({ message: "Invalid latitude or longitude values" });
        return;
      }

      const location = await LocationService.setUserLocation(userId, {
        latitude,
        longitude,
        address,
      });

      res.status(200).json({
        message: "Location set successfully",
        location,
      });
    } catch (error) {
      logger.error("Error setting location", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas ustawiania lokalizacji",
      });
    }
  },
);

/**
 * Get the current user's location
 * @param req Request
 * @param res Response
 */
export const getCurrentUserLocation = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };

      const location = await LocationService.getUserLocation(userId);

      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }

      res.status(200).json(location);
    } catch (error) {
      logger.error("Error getting location", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania lokalizacji",
      });
    }
  },
);

/**
 * Delete the current user's location
 * @param req Request
 * @param res Response
 */
export const deleteLocation = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };

      const deleted = await LocationService.deleteUserLocation(userId);

      if (!deleted) {
        res.status(404).json({ message: "Location not found" });
        return;
      }

      res.status(200).json({
        message: "Location deleted successfully",
      });
    } catch (error) {
      logger.error("Error deleting location", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas usuwania lokalizacji",
      });
    }
  },
);

/**
 * Get another user's location
 * @param req Request
 * @param res Response
 */
export const getUserLocation = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const location = await LocationService.getUserLocation(userId);

      if (!location) {
        res.status(404).json({ message: "Location not found" });
        return;
      }

      res.status(200).json(location);
    } catch (error) {
      logger.error("Error getting other user location", error);
      res.status(500).json({
        message:
          "Wystąpił błąd podczas pobierania lokalizacji innego użytkownika",
      });
    }
  },
);

/**
 * Get distance between current user and another user
 * @param req Request
 * @param res Response
 */
export const getDistanceToUser = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const currentUserId = (req.user as { userId: string }).userId;
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const distance = await LocationService.getDistanceBetweenUsers(
        currentUserId,
        userId,
      );

      if (distance === null) {
        res.status(404).json({
          message: "One or both user locations not found",
        });
        return;
      }

      res.status(200).json({
        distance,
        unit: "kilometers",
      });
    } catch (error) {
      logger.error("Error calculating distance between users", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas obliczania odległości",
      });
    }
  },
);

export const LocationController = {
  setLocation,
  getCurrentUserLocation,
  deleteLocation,
  getUserLocation,
  getDistanceToUser,
};
