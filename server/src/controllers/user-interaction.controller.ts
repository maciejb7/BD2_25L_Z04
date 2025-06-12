import { Request, Response } from "express";
import { UserInteractionService } from "../services/user-interaction.service";
import { LikeStatus } from "../db/models/user-like";
import logger from "../logger";
import { handleRequest } from "../utils/handle-request";

/**
 * Record a user's like or dislike for another user.
 * @param req Request
 * @param res Response
 */
export const recordInteraction = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const { targetUserId, action } = req.body;

      if (!targetUserId) {
        res.status(400).json({ message: "targetUserId is required" });
        return;
      }

      if (
        !action ||
        !Object.values(LikeStatus).includes(action as LikeStatus)
      ) {
        res.status(400).json({
          message: `action is required and must be one of: ${Object.values(LikeStatus).join(", ")}`,
        });
        return;
      }

      const result = await UserInteractionService.recordInteraction(
        userId,
        targetUserId,
        action as LikeStatus,
      );

      // Check if a match was created
      const isMatch = !!result.match;

      res.status(200).json({
        message:
          action === LikeStatus.LIKE
            ? isMatch
              ? "Mamy match!"
              : "Polubiono profil użytkownika"
            : "Pominięto profil użytkownika",
        isMatch,
        match: result.match,
      });
    } catch (error) {
      logger.error("Error recording user interaction", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas zapisywania interakcji",
      });
    }
  },
);

/**
 * Get all matches for the current user.
 * @param req Request
 * @param res Response
 */
export const getUserMatches = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };

      const matches = await UserInteractionService.getUserMatches(userId);

      // Include only the other user's info
      const transformedMatches = matches.map((match) => {
        // const otherUserId =
        //   match.user1Id === userId ? match.user2Id : match.user1Id;
        const otherUser = match.user1Id === userId ? match.user2 : match.user1;

        return {
          matchId: match.matchId,
          matchedAt: match.matchedAt,
          otherUser: otherUser.toJSON(),
        };
      });

      res.status(200).json({
        matches: transformedMatches,
        count: transformedMatches.length,
      });
    } catch (error) {
      logger.error("Error getting user matches", error);
      res.status(500).json({
        message: "Wystąpił błąd podczas pobierania dopasowań",
      });
    }
  },
);

export const UserInteractionController = {
  recordInteraction,
  getUserMatches,
};
