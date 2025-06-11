import { MatchType } from "../db/models/match-type";
import { UserMatchPreference } from "../db/models/user-match-preference";
import { Transaction } from "sequelize";

/**
 * Initialize match types in the database
 * @returns Promise void
 */
const initializeMatchTypes = async (): Promise<void> => {
  const defaultMatchTypes = [
    {
      match_type_name: "friend",
      match_type_description: "Find friends",
    },
    {
      match_type_name: "romantic",
      match_type_description: "Find romantic partners",
    },
    {
      match_type_name: "business",
      match_type_description: "Find business partners",
    },
  ];

  // Create match types if they don't exist
  for (const matchType of defaultMatchTypes) {
    await MatchType.findOrCreate({
      where: { match_type_name: matchType.match_type_name },
      defaults: matchType,
    });
  }
};

/**
 * Get all match types
 * @returns Promise with all match types
 */
const getAllMatchTypes = async (): Promise<MatchType[]> => {
  return await MatchType.findAll();
};

/**
 * Get match preferences for a user
 * @param userId The ID of the user
 * @returns Promise with user's match preferences
 */
const getUserMatchPreferences = async (
  userId: string,
): Promise<MatchType[]> => {
  const userPreferences = await UserMatchPreference.findAll({
    where: { user_id: userId },
    include: [MatchType],
  });

  return userPreferences.map((preference) => preference.matchType);
};

/**
 * Update match preferences for a user
 * @param userId The ID of the user
 * @param matchTypeIds Array of match type IDs to set for the user
 * @param transaction Optional transaction to use
 * @returns Promise void
 */
const updateUserMatchPreferences = async (
  userId: string,
  matchTypeIds: string[],
  transaction?: Transaction,
): Promise<void> => {
  // First, remove all existing preferences for the user
  await UserMatchPreference.destroy({
    where: { user_id: userId },
    transaction,
  });

  // Then, create new preferences
  const preferencePromises = matchTypeIds.map((matchTypeId) =>
    UserMatchPreference.create(
      {
        user_id: userId,
        match_type_id: matchTypeId,
      },
      { transaction },
    ),
  );

  await Promise.all(preferencePromises);
};

export const MatchPreferenceService = {
  initializeMatchTypes,
  getAllMatchTypes,
  getUserMatchPreferences,
  updateUserMatchPreferences,
};
