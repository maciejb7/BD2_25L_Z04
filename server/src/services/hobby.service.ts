import { Transaction } from "sequelize";
import { HobbyCategory, hobbyCategories } from "../db/models/hobby_category";
import { Hobby, hobbies } from "../db/models/hobby";
import { UserHobby } from "../db/models/user_hobby";
import logger from "../logger";
import { database } from "../db/database";

/**
 * Service for handling hobby-related operations
 */
export class HobbyService {
  /**
   * Initialize hobby data in the database
   */
  static async initializeHobbyData(): Promise<void> {
    const transaction = await database.transaction();
    try {
      // Check if categories exist, if not create them
      const categoryCount = await HobbyCategory.count();
      if (categoryCount === 0) {
        logger.info("Initializing hobby category data");
        await HobbyCategory.bulkCreate(hobbyCategories, { transaction });
      }

      // Check if hobbies exist, if not create them
      const hobbyCount = await Hobby.count();
      if (hobbyCount === 0) {
        logger.info("Initializing hobby data");
        await Hobby.bulkCreate(hobbies, { transaction });
      }

      await transaction.commit();
      logger.info("Hobby data initialized successfully");
    } catch (error) {
      await transaction.rollback();
      logger.error("Error initializing hobby data", error);
      throw error;
    }
  }

  /**
   * Get all hobby categories
   */
  static async getAllCategories(): Promise<HobbyCategory[]> {
    return await HobbyCategory.findAll({
      order: [["id", "ASC"]],
    });
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(
    categoryId: number,
  ): Promise<HobbyCategory | null> {
    return await HobbyCategory.findByPk(categoryId);
  }

  /**
   * Get all hobbies
   */
  static async getAllHobbies(): Promise<Hobby[]> {
    return await Hobby.findAll({
      include: [
        {
          model: HobbyCategory,
          attributes: ["hobby_category_name", "hobby_category_description"],
        },
      ],
      order: [["id", "ASC"]],
    });
  }

  /**
   * Get hobbies by category ID
   */
  static async getHobbiesByCategory(categoryId: number): Promise<Hobby[]> {
    return await Hobby.findAll({
      where: { hobby_category_id: categoryId },
      include: [
        {
          model: HobbyCategory,
          attributes: ["hobby_category_name", "hobby_category_description"],
        },
      ],
      order: [["id", "ASC"]],
    });
  }

  /**
   * Get hobby by ID
   */
  static async getHobbyById(hobbyId: number): Promise<Hobby | null> {
    return await Hobby.findByPk(hobbyId, {
      include: [
        {
          model: HobbyCategory,
          attributes: ["hobby_category_name", "hobby_category_description"],
        },
      ],
    });
  }

  /**
   * Get user's hobbies
   */
  static async getUserHobbies(userId: string): Promise<UserHobby[]> {
    return await UserHobby.findAll({
      where: { userId },
      include: [
        {
          model: Hobby,
          include: [
            {
              model: HobbyCategory,
              attributes: ["hobby_category_name", "hobby_category_description"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * Add or update a user's hobby rating
   */
  static async rateHobby(
    userId: string,
    hobbyId: number,
    rating: number,
    transaction?: Transaction,
  ): Promise<UserHobby> {
    const t = transaction || (await database.transaction());

    try {
      // Check if the hobby exists
      const hobby = await Hobby.findByPk(hobbyId, { transaction: t });
      if (!hobby) {
        throw new Error("Hobby not found");
      }

      // Validate rating value
      if (rating < 1 || rating > 10) {
        throw new Error("Rating must be between 1 and 10");
      }

      // Find or create user hobby rating
      const [userHobby, created] = await UserHobby.findOrCreate({
        where: {
          userId,
          hobbyId,
        },
        defaults: {
          rating,
        },
        transaction: t,
      });

      // If not created (already exists), update the rating
      if (!created) {
        userHobby.rating = rating;
        await userHobby.save({ transaction: t });
      }

      // Commit transaction if started
      if (!transaction) {
        await t.commit();
      }

      return userHobby;
    } catch (error) {
      // Rollback transaction if started
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Remove a user's hobby rating
   */
  static async removeHobbyRating(
    userId: string,
    hobbyId: number,
    transaction?: Transaction,
  ): Promise<boolean> {
    const t = transaction || (await database.transaction());

    try {
      const result = await UserHobby.destroy({
        where: {
          userId,
          hobbyId,
        },
        transaction: t,
      });

      // Commit transaction if started it
      if (!transaction) {
        await t.commit();
      }

      return result > 0;
    } catch (error) {
      // Rollback transaction if started it
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  /**
   * Get users by hobby
   */
  static async getUsersByHobby(hobbyId: number): Promise<UserHobby[]> {
    return await UserHobby.findAll({
      where: { hobbyId },
      include: [
        {
          model: Hobby,
          attributes: ["hobby_name", "hobby_description"],
        },
      ],
      order: [["rating", "DESC"]],
    });
  }
}
