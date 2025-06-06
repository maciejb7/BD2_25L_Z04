import { Request, Response } from "express";
import { RecommendationService } from "../services/recommendation.service";
import logger from "../logger";
import { handleRequest } from "../utils/handle-request";

/**
 * Get recommended profiles for the current user.
 * @param req Request
 * @param res Response
 */
export const getRecommendedUsers = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.user as { userId: string };
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const recommendedUsers = await RecommendationService.getRecommendedUsers(
        userId,
        limit,
      );

      res.status(200).json({
        recommendations: recommendedUsers,
        count: recommendedUsers.length,
      });
    } catch (error) {
      logger.error("Error getting recommended users", error);
      res.status(500).json({
        message:
          "Wystąpił błąd podczas pobierania rekomendowanych użytkowników",
      });
    }
  },
);

export const RecommendationController = {
  getRecommendedUsers,
};
