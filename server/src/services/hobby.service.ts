import { Transaction } from "sequelize";
import { HobbyCategory, hobbyCategories } from "../db/models/hobby-category";
import { Hobby, hobbies } from "../db/models/hobby";
import { UserHobby } from "../db/models/user-hobby";
import logger from "../logger";
import { database } from "../db/database";

/**
 * Initialize hobby data in the database
 */
const initializeHobbyData = async (): Promise<void> => {
  const transaction = await database.transaction();
  try {
    const categoryCount = await HobbyCategory.count();
    if (categoryCount === 0) {
      logger.info("Initializing hobby category data");
      await HobbyCategory.bulkCreate(hobbyCategories, { transaction });
    }

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
};

/**
 * Get all hobby categories
 */
const getAllHobbyCategories = async (): Promise<HobbyCategory[]> => {
  return await HobbyCategory.findAll({
    order: [["id", "ASC"]],
  });
};

/**
 * Get category by ID
 */
const getHobbyCategoryById = async (
  categoryId: number,
): Promise<HobbyCategory | null> => {
  return await HobbyCategory.findByPk(categoryId);
};

/**
 * Get all hobbies
 */
const getAllHobbies = async (): Promise<Hobby[]> => {
  return await Hobby.findAll({
    include: [
      {
        model: HobbyCategory,
        attributes: ["hobby_category_name", "hobby_category_description"],
      },
    ],
    order: [["id", "ASC"]],
  });
};

/**
 * Get hobbies by category ID
 */
const getHobbiesByCategory = async (categoryId: number): Promise<Hobby[]> => {
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
};

/**
 * Get hobby by ID
 */
export const getHobbyById = async (hobbyId: number): Promise<Hobby | null> => {
  return await Hobby.findByPk(hobbyId, {
    include: [
      {
        model: HobbyCategory,
        attributes: ["hobby_category_name", "hobby_category_description"],
      },
    ],
  });
};

/**
 * Get user's hobbies
 */
export const getUserHobbies = async (userId: string): Promise<UserHobby[]> => {
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
};

/**
 * Add or update a user's hobby rating
 */
const rateHobby = async (
  userId: string,
  hobbyId: number,
  rating: number,
  transaction?: Transaction,
): Promise<UserHobby> => {
  const t = transaction || (await database.transaction());

  try {
    const hobby = await Hobby.findByPk(hobbyId, { transaction: t });
    if (!hobby) {
      throw new Error("Hobby not found");
    }

    if (rating < 1 || rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

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

    if (!created) {
      userHobby.rating = rating;
      await userHobby.save({ transaction: t });
    }

    if (!transaction) {
      await t.commit();
    }

    return userHobby;
  } catch (error) {
    if (!transaction) {
      await t.rollback();
    }
    throw error;
  }
};

/**
 * Remove a user's hobby rating
 */
const removeHobbyRating = async (
  userId: string,
  hobbyId: number,
  transaction?: Transaction,
): Promise<boolean> => {
  const t = transaction || (await database.transaction());

  try {
    const result = await UserHobby.destroy({
      where: {
        userId,
        hobbyId,
      },
      transaction: t,
    });

    if (!transaction) {
      await t.commit();
    }

    return result > 0;
  } catch (error) {
    if (!transaction) {
      await t.rollback();
    }
    throw error;
  }
};

/**
 * Get users by hobby
 */
const getUsersByHobby = async (hobbyId: number): Promise<UserHobby[]> => {
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
};

export const HobbyService = {
  initializeHobbyData,
  getAllHobbyCategories,
  getHobbyCategoryById,
  getAllHobbies,
  getHobbiesByCategory,
  getHobbyById,
  getUserHobbies,
  rateHobby,
  removeHobbyRating,
  getUsersByHobby,
};
