import { config } from "../config";
import { Sequelize } from "sequelize-typescript";
import { User } from "./models/user";
import { Session } from "./models/session";
import { MatchType } from "./models/match-type";
import { UserMatchPreference } from "./models/user-match-preference";
import { UserLike } from "./models/user-like";
import { UserMatch } from "./models/user-match";
import { HobbyCategory } from "./models/hobby-category";
import { Hobby } from "./models/hobby";
import { UserHobby } from "./models/user-hobby";
import { MusicGenre } from "./models/music-genre";
import { MusicArtist } from "./models/music-artist";
import { MusicAlbum } from "./models/music-album";
import { MusicTrack } from "./models/music-track";
import { UserMusic } from "./models/user-music";
import { UserLocation } from "./models/user-location";
import { PasswordResetLink } from "./models/password-reset-link";
const models = [
  User,
  Session,
  MatchType,
  UserMatchPreference,
  UserLike,
  UserMatch,
  HobbyCategory,
  Hobby,
  UserHobby,
  MusicGenre,
  MusicArtist,
  MusicAlbum,
  MusicTrack,
  UserMusic,
  UserLocation,
  PasswordResetLink,
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
