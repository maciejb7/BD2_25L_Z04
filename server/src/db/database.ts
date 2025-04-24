import { config } from "../config";
import { Sequelize } from "sequelize-typescript";
import { User } from "./models/user";
import { Session } from "./models/session";
import { MatchType } from "./models/match_type";
import { UserMatchPreference } from "./models/user_match_preference";
import { UserLike } from "./models/user_like";
import { UserMatch } from "./models/user_match";
import { MusicGenre } from "./models/music_genre";
import { MusicArtist } from "./models/music_artist";
import { MusicAlbum } from "./models/music_album";
import { MusicTrack } from "./models/music_track";
import { UserMusic } from "./models/user_music";
import { UserLocation } from "./models/user_location";

const models = [
  User,
  Session,
  MatchType,
  UserMatchPreference,
  UserLike,
  UserMatch,
  MusicGenre,
  MusicArtist,
  MusicAlbum,
  MusicTrack,
  UserMusic,
  UserLocation,
];

export const database = new Sequelize({
  dialect: "postgres",
  host: config.DB_HOST,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  models: models,
  logging: config.LOGS_DB_CONSOLE === "true" ? console.log : false,
});
