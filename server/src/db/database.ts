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
