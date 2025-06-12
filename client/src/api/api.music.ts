import api, { handleApiError } from "./api";

export interface MusicArtist {
  music_artist_id: number;
  music_artist_name: string;
  music_artist_picture_small?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicGenre {
  music_genre_id: number;
  music_genre_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicAlbum {
  music_album_id: number;
  music_album_title: string;
  music_artist_id: number;
  music_album_cover_small?: string;
  music_album_release_date?: string;
  music_genre_id?: number;
  createdAt: string;
  updatedAt: string;
  artist?: MusicArtist;
  genre?: MusicGenre;
}

export interface MusicTrack {
  music_track_id: number;
  music_track_title: string;
  music_album_id: number;
  music_artist_id: number;
  music_track_preview_link?: string;
  music_track_deezer_link?: string;
  createdAt: string;
  updatedAt: string;
  artist: MusicArtist;
  album: MusicAlbum;
}

export interface UserMusic {
  id: string;
  user_id: string;
  music_track_id: number;
  added_at: string;
  createdAt: string;
  updatedAt: string;
  track: MusicTrack;
}

export interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  preview: string;
  link: string;
  artist: {
    id: number;
    name: string;
    picture_small: string;
    link: string;
  };
  album: {
    id: number;
    title: string;
    cover_small: string;
    link: string;
  };
}

export interface TrackDetails {
  track: MusicTrack;
  artist: MusicArtist;
  album: MusicAlbum;
}

export interface UserFavoriteTrack {
  track: MusicTrack;
  artist: MusicArtist;
  album: MusicAlbum;
}

// Backend API response interfaces
interface SearchTracksResponse {
  results: DeezerTrack[];
  count: number;
}

interface GetFavoritesResponse {
  favorites: UserFavoriteTrack[];
  count: number;
}

interface AddFavoriteResponse {
  message: string;
  track: MusicTrack;
}

// Protected routes (all music routes are protected)
export const searchTracks = async (query: string): Promise<DeezerTrack[]> => {
  try {
    const params = new URLSearchParams();
    params.append('q', query);

    const response = await api.get<SearchTracksResponse>(`/api/music/search?${params.toString()}`);
    return response.data.results;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas wyszukiwania utworów. Spróbuj ponownie.",
    );
  }
};

export const getTrackDetails = async (trackId: number): Promise<TrackDetails> => {
  try {
    const response = await api.get<TrackDetails>(`/api/music/tracks/${trackId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania szczegółów utworu. Spróbuj ponownie.",
    );
  }
};

export const getUserFavoriteTracks = async (userId?: string): Promise<UserFavoriteTrack[]> => {
  try {
    const url = userId ? `/api/music/favorites/user/${userId}` : '/api/music/favorites';
    const response = await api.get<GetFavoritesResponse>(url);
    return response.data.favorites;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas pobierania ulubionych utworów. Spróbuj ponownie.",
    );
  }
};

export const addFavoriteTrack = async (trackData: DeezerTrack): Promise<AddFavoriteResponse> => {
  try {
    const response = await api.post<AddFavoriteResponse>('/api/music/favorites', { trackData });
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas dodawania utworu do ulubionych. Spróbuj ponownie.",
    );
  }
};

export const removeFavoriteTrack = async (trackId: number): Promise<any> => {
  try {
    const response = await api.delete(`/api/music/favorites/${trackId}`);
    return response.data;
  } catch (error: unknown) {
    throw handleApiError(
      error,
      "Wystąpił błąd podczas usuwania utworu z ulubionych. Spróbuj ponownie.",
    );
  }
};