import axios from "axios";
import { MusicTrack } from "../db/models/music_track";
import { MusicArtist } from "../db/models/music_artist";
import { MusicAlbum } from "../db/models/music_album";
import { MusicGenre } from "../db/models/music_genre";
import { UserMusic } from "../db/models/user_music";
import { Transaction } from "sequelize";
import { database } from "../db/database";
import logger from "../logger";

interface DeezerArtist {
  id: number;
  name: string;
  picture_small: string;
  link: string;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_small: string;
  link: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  preview: string;
  link: string;
  artist: DeezerArtist;
  album: DeezerAlbum;
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
}

interface DeezerGenre {
  id: number;
  name: string;
}

interface DeezerAlbumDetails {
  id: number;
  title: string;
  cover_small: string;
  release_date: string;
  genre_id: number;
  genres: {
    data: DeezerGenre[];
  };
  artist: DeezerArtist;
}

const DEEZER_API_BASE = "https://api.deezer.com";

/**
 * Search for tracks using Deezer API
 * @param query Search query
 * @returns Promise with search results
 */
const searchTracks = async (query: string): Promise<DeezerTrack[]> => {
  try {
    // URL encode the query
    const encodedQuery = encodeURIComponent(`track:"${query}" strict=on`);
    const response = await axios.get<DeezerSearchResponse>(
      `${DEEZER_API_BASE}/search?q=${encodedQuery}`,
    );
    return response.data.data;
  } catch (error) {
    logger.error("Error searching tracks from Deezer API", error);
    throw new Error("Failed to search tracks");
  }
};

/**
 * Get album details from Deezer API
 * @param albumId Album ID
 * @returns Promise with album details
 */
const getAlbumDetails = async (
  albumId: number,
): Promise<DeezerAlbumDetails> => {
  try {
    const response = await axios.get<DeezerAlbumDetails>(
      `${DEEZER_API_BASE}/album/${albumId}`,
    );
    return response.data;
  } catch (error) {
    logger.error("Error getting album details from Deezer API", error);
    throw new Error("Failed to get album details");
  }
};

/**
 * Save a track to the database if it doesn't exist
 * @param track Track data from Deezer API
 * @param transaction Optional transaction
 * @returns Promise with the saved track
 */
const saveTrack = async (
  track: DeezerTrack,
  transaction?: Transaction,
): Promise<MusicTrack> => {
  const t = transaction || (await database.transaction());

  try {
    const [artist] = await MusicArtist.findOrCreate({
      where: { music_artist_id: track.artist.id },
      defaults: {
        music_artist_id: track.artist.id,
        music_artist_name: track.artist.name,
        music_artist_picture_small: track.artist.picture_small,
      },
      transaction: t,
    });

    const albumDetails = await getAlbumDetails(track.album.id);
    let genreId = null;
    if (albumDetails.genres?.data?.length > 0) {
      const genre = albumDetails.genres.data[0];
      const [savedGenre] = await MusicGenre.findOrCreate({
        where: { music_genre_id: genre.id },
        defaults: {
          music_genre_id: genre.id,
          music_genre_name: genre.name,
        },
        transaction: t,
      });
      genreId = savedGenre.music_genre_id;
    }

    const [album] = await MusicAlbum.findOrCreate({
      where: { music_album_id: track.album.id },
      defaults: {
        music_album_id: track.album.id,
        music_album_title: track.album.title,
        music_artist_id: artist.music_artist_id,
        music_album_cover_small: track.album.cover_small,
        music_album_release_date: albumDetails.release_date
          ? new Date(albumDetails.release_date)
          : null,
        music_genre_id: genreId,
      },
      transaction: t,
    });

    const [savedTrack] = await MusicTrack.findOrCreate({
      where: { music_track_id: track.id },
      defaults: {
        music_track_id: track.id,
        music_track_title: track.title,
        music_album_id: album.music_album_id,
        music_artist_id: artist.music_artist_id,
        music_track_preview_link: track.preview,
        music_track_deezer_link: track.link,
      },
      transaction: t,
    });

    // Commit the transaction
    if (!transaction) {
      await t.commit();
    }

    return savedTrack;
  } catch (error) {
    // If we started the transaction, roll it back
    if (!transaction) {
      await t.rollback();
    }
    logger.error("Error saving track to database", error);
    throw error;
  }
};

/**
 * Add a track to a user's favorites
 * @param userId User ID
 * @param trackId Track ID
 * @returns Promise with the created UserMusic entry
 */
const addFavoriteTrack = async (
  userId: string,
  trackId: number,
): Promise<UserMusic> => {
  const transaction = await database.transaction();

  try {
    const track = await MusicTrack.findByPk(trackId);

    if (!track) {
      throw new Error("Track not found in database");
    }

    const existingFavorite = await UserMusic.findOne({
      where: {
        user_id: userId,
        music_track_id: trackId,
      },
    });

    if (existingFavorite) {
      throw new Error("Track is already in user's favorites");
    }

    const userMusic = await UserMusic.create(
      {
        user_id: userId,
        music_track_id: trackId,
        added_at: new Date(),
      },
      { transaction },
    );

    await transaction.commit();
    return userMusic;
  } catch (error) {
    await transaction.rollback();
    logger.error("Error adding favorite track", error);
    throw error;
  }
};

/**
 * Remove a track from a user's favorites
 * @param userId User ID
 * @param trackId Track ID
 * @returns Promise<boolean> True if track was removed
 */
const removeFavoriteTrack = async (
  userId: string,
  trackId: number,
): Promise<boolean> => {
  try {
    const deleted = await UserMusic.destroy({
      where: {
        user_id: userId,
        music_track_id: trackId,
      },
    });

    return deleted > 0;
  } catch (error) {
    logger.error("Error removing favorite track", error);
    throw error;
  }
};

/**
 * Get a user's favorite tracks
 * @param userId User ID
 * @returns Promise with the user's favorite tracks
 */
const getUserFavoriteTracks = async (
  userId: string,
): Promise<{ track: MusicTrack; artist: MusicArtist; album: MusicAlbum }[]> => {
  try {
    const favorites = await UserMusic.findAll({
      where: { user_id: userId },
      include: [
        {
          model: MusicTrack,
          include: [{ model: MusicArtist }, { model: MusicAlbum }],
        },
      ],
      order: [["added_at", "DESC"]],
    });

    return favorites.map((fav) => ({
      track: fav.track,
      artist: fav.track.artist,
      album: fav.track.album,
    }));
  } catch (error) {
    logger.error("Error getting user favorite tracks", error);
    throw error;
  }
};

/**
 * Get track details including artist and album information
 * @param trackId Track ID
 * @returns Promise with track details
 */
const getTrackDetails = async (
  trackId: number,
): Promise<{
  track: MusicTrack;
  artist: MusicArtist;
  album: MusicAlbum;
} | null> => {
  try {
    const track = await MusicTrack.findByPk(trackId, {
      include: [
        { model: MusicArtist },
        { model: MusicAlbum, include: [{ model: MusicGenre }] },
      ],
    });

    if (!track) {
      return null;
    }

    return {
      track,
      artist: track.artist,
      album: track.album,
    };
  } catch (error) {
    logger.error("Error getting track details", error);
    throw error;
  }
};

export const MusicService = {
  searchTracks,
  getAlbumDetails,
  saveTrack,
  addFavoriteTrack,
  removeFavoriteTrack,
  getUserFavoriteTracks,
  getTrackDetails,
};
