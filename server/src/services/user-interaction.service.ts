import { Transaction } from "sequelize";
import { User } from "../db/models/user";
import { UserLike, LikeStatus } from "../db/models/user_like";
import { UserMatch } from "../db/models/user_match";
import { database } from "../db/database";

/**
 * Service for handling user interactions (likes, dislikes, matches).
 */
export class UserInteractionService {
  /**
   * Record a user's like or dislike for another user.
   * If both users like each other, create a match.
   *
   * @param likerId The ID of the user giving the like/dislike
   * @param likeeId The ID of the user receiving the like/dislike
   * @param status LIKE or DISLIKE
   * @param transaction Optional transaction to use
   * @returns Promise<{ like: UserLike, match?: UserMatch }> The created like and match (if created)
   */
  static async recordInteraction(
    likerId: string,
    likeeId: string,
    status: LikeStatus,
    transaction?: Transaction,
  ): Promise<{ like: UserLike; match?: UserMatch }> {
    // Begin a transaction if it wasn't already provided
    const t = transaction || (await database.transaction());

    try {
      // Check if users exist
      const [liker, likee] = await Promise.all([
        User.findByPk(likerId),
        User.findByPk(likeeId),
      ]);

      if (!liker || !likee) {
        throw new Error("One or both users do not exist");
      }

      // Create or update the user like
      const [userLike, created] = await UserLike.findOrCreate({
        where: {
          likerId,
          likeeId,
        },
        defaults: {
          status,
        },
        transaction: t,
      });

      // If not created, update the status
      if (!created) {
        userLike.status = status;
        await userLike.save({ transaction: t });
      }

      let match: UserMatch | undefined;

      // If it's a like, check if the other user has also liked this user
      if (status === LikeStatus.LIKE) {
        const mutualLike = await UserLike.findOne({
          where: {
            likerId: likeeId,
            likeeId: likerId,
            status: LikeStatus.LIKE,
          },
          transaction: t,
        });

        // If there's a mutual like, create a match
        if (mutualLike) {
          // Sort the user IDs to ensure consistency
          const [user1Id, user2Id] = [likerId, likeeId].sort();

          // Check if a match already exists
          const existingMatch = await UserMatch.findOne({
            where: {
              user1Id,
              user2Id,
            },
            transaction: t,
          });

          if (existingMatch) {
            // If match exists but is inactive, reactivate it
            if (!existingMatch.isActive) {
              existingMatch.isActive = true;
              existingMatch.matchedAt = new Date();
              await existingMatch.save({ transaction: t });
              match = existingMatch;
            } else {
              match = existingMatch;
            }
          } else {
            // Create a new match
            match = await UserMatch.create(
              {
                user1Id,
                user2Id,
                isActive: true,
                matchedAt: new Date(),
              },
              { transaction: t },
            );
          }
        }
      } else if (status === LikeStatus.DISLIKE) {
        // If it's a dislike, deactivate any existing match
        const [user1Id, user2Id] = [likerId, likeeId].sort();

        const existingMatch = await UserMatch.findOne({
          where: {
            user1Id,
            user2Id,
            isActive: true,
          },
          transaction: t,
        });

        if (existingMatch) {
          existingMatch.isActive = false;
          await existingMatch.save({ transaction: t });
        }
      }

      // If we started the transaction, commit it
      if (!transaction) {
        await t.commit();
      }

      return { like: userLike, match };
    } catch (error) {
      // If we started the transaction, roll it back
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Get all active matches for a user.
   *
   * @param userId The ID of the user to get matches for
   * @returns Promise with the user's matches
   */
  static async getUserMatches(userId: string): Promise<UserMatch[]> {
    return UserMatch.findAll({
      where: {
        [database.Sequelize.Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        isActive: true,
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: [
            "userId",
            "nickname",
            "name",
            "surname",
            "birthDate",
            "gender",
          ],
        },
        {
          model: User,
          as: "user2",
          attributes: [
            "userId",
            "nickname",
            "name",
            "surname",
            "birthDate",
            "gender",
          ],
        },
      ],
      order: [["matchedAt", "DESC"]],
    });
  }
}
