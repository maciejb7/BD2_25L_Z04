import { Request, Response } from "express";
import { MatchPreferenceService } from "../services/match-preference.service";
import logger from "../logger";
import { database } from "../db/database";
import { handleRequest } from "../utils/handle-request";

/**
 * Get all match types
 * @param req Request
 * @param res Response
 */
export const getAllMatchTypes = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const matchTypes = await MatchPreferenceService.getAllMatchTypes();
      res.status(200).json(matchTypes);
    } catch (error) {
      logger.error("Error getting match types", error);
      res
        .status(500)
        .json({ message: "Wystąpił błąd podczas pobierania typów dopasowań" });
    }
  },
);

/**
 * Get match preferences for the current user
 * @param req Request
 * @param res Response
 */
export const getUserMatchPreferences = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const matchPreferences =
        await MatchPreferenceService.getUserMatchPreferences(userId);
      res.status(200).json(matchPreferences);
    } catch (error) {
      logger.error("Error getting user match preferences", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania preferencji dopasowań",
      });
    }
  },
);

/**
 * Update match preferences for the current user
 * @param req Request
 * @param res Response
 */
export const updateUserMatchPreferences = handleRequest(
  async (req: Request, res: Response) => {
    const transaction = await database.transaction();
    try {
      const { userId } = req.user as { userId: string };
      const { matchTypeIds } = req.body;

      if (!Array.isArray(matchTypeIds)) {
        res.status(400).json({ message: "matchTypeIds must be an array" });
        return;
      }

      await MatchPreferenceService.updateUserMatchPreferences(
        userId,
        matchTypeIds,
        transaction,
      );

      await transaction.commit();
      res
        .status(200)
        .json({ message: "Preferencje dopasowań zaktualizowane pomyślnie" });
    } catch (error) {
      await transaction.rollback();
      logger.error("Error updating user match preferences", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas aktualizacji preferencji dopasowań",
      });
    }
  },
);

export const MatchPreferenceController = {
  getAllMatchTypes,
  getUserMatchPreferences,
  updateUserMatchPreferences,
};
