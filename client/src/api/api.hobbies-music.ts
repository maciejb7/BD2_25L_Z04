import api, { handleApiError } from "./api";

// Hobby interfaces
export interface HobbyCategory {
  id: number;
  hobby_category_name: string;
  hobby_category_description: string;
}

export interface Hobby {
  id: number;
  hobby_name: string;
  hobby_description: string;
  hobby_category_id: number;
  category: HobbyCategory;
}

export interface UserHobby {
  id: string;
  userId: string;
  hobbyId: number;
  rating: number;
  hobby: Hobby;
}

// Music interfaces
export interface MusicArtist {
  music_artist_id: number;
  music_artist_name: string;
  music_artist_picture_small: string;
}

export interface MusicAlbum {
  music_album_id: number;
  music_album_title: string;
  music_artist_id: number;
  music_album_cover_small: string;
  music_album_release_date: string;
  music_genre_id: number | null;
}

export interface MusicTrack {
  music_track_id: number;
  music_track_title: string;
  music_album_id: number;
  music_artist_id: number;
  music_track_preview_link: string;
  music_track_deezer_link: string;
  artist: MusicArtist;
  album: MusicAlbum;
}

export interface UserMusicFavorite {
  track: MusicTrack;
  artist: MusicArtist;
  album: MusicAlbum;
}

export interface UserMusicResponse {
  favorites: UserMusicFavorite[];
  count: number;
}

/**
 * Get user's hobbies with ratings and categories
 * @param userId - ID of the user to get hobbies for
 * @returns Promise with user's hobbies
 */
export const getUserHobbies = async (userId: string): Promise<UserHobby[]> => {
  try {
    const response = await api.get<UserHobby[]>(`/api/hobbies/admin/users/${userId}/hobbies`);
    return response.data;
  } catch (error: unknown) {
    // Return empty array if no hobbies found or no permission
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404 || axiosError.response?.status === 403) {
        return [];
      }
    }
    // For other errors, also return empty array to not break the UI
    console.warn("Could not fetch user hobbies:", error);
    return [];
  }
};

/**
 * Get current user's hobbies
 * @returns Promise with current user's hobbies
 */
export const getCurrentUserHobbies = async (): Promise<UserHobby[]> => {
  try {
    const response = await api.get<UserHobby[]>("/api/hobbies/user/hobbies");
    return response.data;
  } catch (error: unknown) {
    // Return empty array if no hobbies found
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return [];
      }
    }
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania twoich hobby.",
    );
  }
};

/**
 * Get user's favorite music tracks
 * @param userId - ID of the user to get music for
 * @returns Promise with user's favorite music
 */
export const getUserFavoriteMusic = async (userId: string): Promise<UserMusicResponse> => {
  try {
    const response = await api.get<UserMusicResponse>(`/api/music/favorites/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    // Return empty response if no music found or no permission
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404 || axiosError.response?.status === 403) {
        return { favorites: [], count: 0 };
      }
    }
    // For other errors, also return empty response to not break the UI
    console.warn("Could not fetch user music:", error);
    return { favorites: [], count: 0 };
  }
};

/**
 * Get current user's favorite music tracks
 * @returns Promise with current user's favorite music
 */
export const getCurrentUserFavoriteMusic = async (): Promise<UserMusicResponse> => {
  try {
    const response = await api.get<UserMusicResponse>("/api/music/favorites");
    return response.data;
  } catch (error: unknown) {
    // Return empty response if no music found
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return { favorites: [], count: 0 };
      }
    }
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania twoich ulubionych utworów.",
    );
  }
};