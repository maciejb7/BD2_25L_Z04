import { Op } from "sequelize";
import { User } from "../db/models/user";
import { UserMatchPreference } from "../db/models/user_match_preference";
import { MatchType } from "../db/models/match_type";
import { UserLike } from "../db/models/user_like";

/**
 * Service for handling user recommendations.
 */
export class RecommendationService {
  /**
   * Get recommended users for a user.
   * Recommendations are based on match preferences and exclude already liked/disliked users.
   *
   * @param userId The ID of the user to get recommendations for
   * @param limit The maximum number of recommendations to return
   * @returns Promise with recommended users
   */
  static async getRecommendedUsers(
    userId: string,
    limit = 10,
  ): Promise<User[]> {
    // 1. Get the current user's match preferences
    const userPreferences = await UserMatchPreference.findAll({
      where: { user_id: userId },
      include: [MatchType],
    });

    const userPreferenceTypes = userPreferences.map(
      (pref) => pref.match_type_id,
    );

    if (userPreferenceTypes.length === 0) {
      return [];
    }

    // 2. Get users who have liked at least one of the same match types
    const potentialMatches = await User.findAll({
      include: [
        {
          model: UserMatchPreference,
          where: {
            match_type_id: {
              [Op.in]: userPreferenceTypes,
            },
          },
          required: true,
        },
      ],
      where: {
        userId: {
          [Op.ne]: userId, // Exclude the current user
        },
      },
    });

    if (potentialMatches.length === 0) {
      return [];
    }

    // 3. Get IDs of users that the current user has already liked or disliked
    const existingInteractions = await UserLike.findAll({
      where: {
        likerId: userId,
      },
      attributes: ["likeeId"],
    });

    const interactedUserIds = existingInteractions.map(
      (interaction) => interaction.likeeId,
    );

    // 4. Filter out users that the current user has already interacted with
    const filteredMatches = potentialMatches.filter(
      (user) => !interactedUserIds.includes(user.userId),
    );

    // 5. Shuffle the results
    const shuffled = this.shuffleArray([...filteredMatches]);

    // 6. Return the specified number of recommendations
    return shuffled.slice(0, limit);
  }

  // Shuffle array (Fisher-Yates)
  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
