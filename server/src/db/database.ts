import { config } from "../config";
import { Sequelize } from "sequelize-typescript";
import { User } from "./models/user";
import { Session } from "./models/session";
import { MatchType } from "./models/match_type";
import { UserMatchPreference } from "./models/user_match_preference";
import { UserLike } from "./models/user_like";
import { UserMatch } from "./models/user_match";
import { HobbyCategory } from "./models/hobby_category";
import { Hobby } from "./models/hobby";
import { UserHobby } from "./models/user_hobby";
import { MusicGenre } from "./models/music_genre";
import { MusicArtist } from "./models/music_artist";
import { MusicAlbum } from "./models/music_album";
import { MusicTrack } from "./models/music_track";
import { UserMusic } from "./models/user_music";
import { UserLocation } from "./models/user_location";
import { MovieGenre } from "./models/movie_genre";
import { Movie } from "./models/movies";
import { UserMovie } from "./models/user_movie";
import { BookAuthor } from "./models/book_author";
import { Book } from "./models/book";
import { UserBook } from "./models/user_books";

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
  MovieGenre,
  Movie,
  UserMovie,
  BookAuthor,
  Book,
  UserBook,
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
