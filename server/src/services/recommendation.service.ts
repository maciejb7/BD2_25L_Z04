import { Op } from "sequelize";
import { User } from "../db/models/user";
import { UserMatchPreference } from "../db/models/user-match-preference";
import { MatchType } from "../db/models/match-type";
import { UserLike } from "../db/models/user-like";
import { UserHobby } from "../db/models/user-hobby";
import { Hobby } from "../db/models/hobby";
import { HobbyCategory } from "../db/models/hobby-category";
import { UserLocation } from "../db/models/user-location";
import { UserMusic } from "../db/models/user-music";
import { MusicTrack } from "../db/models/music-track";
import { MusicArtist } from "../db/models/music-artist";
import { MusicAlbum } from "../db/models/music-album";
import { MusicGenre } from "../db/models/music-genre";

interface UserScore {
  user: User;
  score: number;
  hobbyScore: number;
  locationScore: number;
  musicScore: number;
}

interface UserHobbyData {
  hobbyId: number;
  categoryId: number;
  rating: number;
}

interface UserMusicData {
  trackId: number;
  artistId: number;
  genreId: number | null;
}

/**
 * Get recommended users for a user.
 * Recommendations are based on match preferences (scored by hobby, location, and music similarity).
 *
 * @param userId The ID of the user to get recommendations for
 * @param limit The maximum number of recommendations to return
 * @returns Promise with recommended users sorted by compatibility score
 */
const getRecommendedUsers = async (
  userId: string,
  limit = 10,
): Promise<User[]> => {
  // 1. Get the current user's match preferences
  const userPreferences = await UserMatchPreference.findAll({
    where: { user_id: userId },
    include: [MatchType],
  });

  const userPreferenceTypes = userPreferences.map((pref) => pref.match_type_id);

  if (userPreferenceTypes.length === 0) {
    return [];
  }

  // 2. Get users who have at least one matching preference type
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

  // 3. Filter out users that the current user has already interacted with
  const existingInteractions = await UserLike.findAll({
    where: {
      likerId: userId,
    },
    attributes: ["likeeId"],
  });

  const interactedUserIds = existingInteractions.map(
    (interaction) => interaction.likeeId,
  );

  const filteredMatches = potentialMatches.filter(
    (user) => !interactedUserIds.includes(user.userId),
  );

  if (filteredMatches.length === 0) {
    return [];
  }

  // 4. Get current user's data for scoring
  const [currentUserHobbies, currentUserLocation, currentUserMusic] =
    await Promise.all([
      getUserHobbyData(userId),
      getUserLocation(userId),
      getUserMusicData(userId),
    ]);

  // 5. Score potential matches
  const scoredUsers: UserScore[] = await Promise.all(
    filteredMatches.map(async (user) => {
      const [userHobbies, userLocation, userMusic] = await Promise.all([
        getUserHobbyData(user.userId),
        getUserLocation(user.userId),
        getUserMusicData(user.userId),
      ]);

      const hobbyScore = calculateHobbyScore(currentUserHobbies, userHobbies);
      const locationScore = calculateLocationScore(
        currentUserLocation,
        userLocation,
      );
      const musicScore = calculateMusicScore(currentUserMusic, userMusic);

      // Weighted combination of scores
      const totalScore =
        hobbyScore * 0.4 + locationScore * 0.3 + musicScore * 0.3;

      return {
        user,
        score: totalScore,
        hobbyScore,
        locationScore,
        musicScore,
      };
    }),
  );

  // 6. Sort by score (highest first) and return top results
  const sortedUsers = scoredUsers
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return sortedUsers.map((scored) => scored.user);
};

/**
 * Get user's hobby data (with ratings and categories)
 */
const getUserHobbyData = async (userId: string): Promise<UserHobbyData[]> => {
  const userHobbies = await UserHobby.findAll({
    where: { userId },
    include: [
      {
        model: Hobby,
        include: [HobbyCategory],
      },
    ],
  });

  return userHobbies.map((uh) => ({
    hobbyId: uh.hobbyId,
    categoryId: uh.hobby.hobby_category_id,
    rating: uh.rating,
  }));
};

/**
 * Get user's location data
 */
const getUserLocation = async (
  userId: string,
): Promise<UserLocation | null> => {
  return await UserLocation.findOne({
    where: { user_id: userId },
  });
};

/**
 * Get user's music data with tracks, artists, and genres
 */
const getUserMusicData = async (userId: string): Promise<UserMusicData[]> => {
  const userMusic = await UserMusic.findAll({
    where: { user_id: userId },
    include: [
      {
        model: MusicTrack,
        include: [
          MusicArtist,
          {
            model: MusicAlbum,
            include: [MusicGenre],
          },
        ],
      },
    ],
  });

  return userMusic.map((um) => ({
    trackId: um.music_track_id,
    artistId: um.track.music_artist_id,
    genreId: um.track.album?.music_genre_id || null,
  }));
};

/**
 * Calculate hobby similarity score (0-100)
 * Considers both specific hobbies and hobby categories
 */
const calculateHobbyScore = (
  currentUserHobbies: UserHobbyData[],
  targetUserHobbies: UserHobbyData[],
): number => {
  if (currentUserHobbies.length === 0 || targetUserHobbies.length === 0) {
    return 0;
  }

  let score = 0;
  let maxPossibleScore = 0;

  // Create maps for easier lookup
  const currentHobbyMap = new Map(
    currentUserHobbies.map((h) => [h.hobbyId, h.rating]),
  );
  const currentCategoryMap = new Map<number, number[]>();

  // Group current user's hobbies by category
  currentUserHobbies.forEach((h) => {
    if (!currentCategoryMap.has(h.categoryId)) {
      currentCategoryMap.set(h.categoryId, []);
    }
    currentCategoryMap.get(h.categoryId)!.push(h.rating);
  });

  targetUserHobbies.forEach((targetHobby) => {
    const currentRating = currentHobbyMap.get(targetHobby.hobbyId);

    if (currentRating !== undefined) {
      // Exact hobby match - higher weight
      const compatibility = 10 - Math.abs(currentRating - targetHobby.rating);
      score += compatibility * 2; // Double weight for exact matches
      maxPossibleScore += 20;
    } else {
      // Check for category match
      const categoryRatings = currentCategoryMap.get(targetHobby.categoryId);
      if (categoryRatings && categoryRatings.length > 0) {
        const avgCategoryRating =
          categoryRatings.reduce((a, b) => a + b, 0) / categoryRatings.length;
        const compatibility =
          10 - Math.abs(avgCategoryRating - targetHobby.rating);
        score += compatibility; // Single weight for category matches
        maxPossibleScore += 10;
      }
    }
  });

  return maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
};

/**
 * Calculate location similarity score (0-100)
 * Closer distance = higher score
 */
const calculateLocationScore = (
  currentUserLocation: UserLocation | null,
  targetUserLocation: UserLocation | null,
): number => {
  if (!currentUserLocation || !targetUserLocation) {
    return 0; // No location data available
  }

  const distance = calculateDistance(
    currentUserLocation.latitude,
    currentUserLocation.longitude,
    targetUserLocation.latitude,
    targetUserLocation.longitude,
  );

  // Score decreases with distance
  // 100 for same location, 50 for 50km, 0 for 200km+
  const maxDistance = 200; // km
  const score = Math.max(0, 100 - (distance / maxDistance) * 100);

  return score;
};

/**
 * Calculate music similarity score (0-100)
 * Considers shared tracks, artists, and genres
 */
const calculateMusicScore = (
  currentUserMusic: UserMusicData[],
  targetUserMusic: UserMusicData[],
): number => {
  if (currentUserMusic.length === 0 || targetUserMusic.length === 0) {
    return 0;
  }

  const currentTracks = new Set(currentUserMusic.map((m) => m.trackId));
  const currentArtists = new Set(currentUserMusic.map((m) => m.artistId));
  const currentGenres = new Set(
    currentUserMusic.map((m) => m.genreId).filter((g) => g !== null),
  );

  const targetTracks = new Set(targetUserMusic.map((m) => m.trackId));
  const targetArtists = new Set(targetUserMusic.map((m) => m.artistId));
  const targetGenres = new Set(
    targetUserMusic.map((m) => m.genreId).filter((g) => g !== null),
  );

  // Calculate overlaps
  const sharedTracks = setIntersection(currentTracks, targetTracks).size;
  const sharedArtists = setIntersection(currentArtists, targetArtists).size;
  const sharedGenres = setIntersection(currentGenres, targetGenres).size;

  // Calculate scores with different weights
  const trackScore =
    sharedTracks > 0
      ? (sharedTracks / Math.min(currentTracks.size, targetTracks.size)) * 100
      : 0;
  const artistScore =
    sharedArtists > 0
      ? (sharedArtists / Math.min(currentArtists.size, targetArtists.size)) *
        100
      : 0;
  const genreScore =
    sharedGenres > 0
      ? (sharedGenres / Math.min(currentGenres.size, targetGenres.size)) * 100
      : 0;

  // Weighted combination (tracks > artists > genres)
  const totalScore = trackScore * 0.5 + artistScore * 0.3 + genreScore * 0.2;

  return totalScore;
};

/**
 * Calculate distance between two points (Haversine formula)
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Get intersection of two sets
 */
const setIntersection = <T>(setA: Set<T>, setB: Set<T>): Set<T> => {
  return new Set([...setA].filter((x) => setB.has(x)));
};

// Shuffle array (Fisher-Yates)
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const RecommendationService = {
  getRecommendedUsers,
  shuffleArray,
};
