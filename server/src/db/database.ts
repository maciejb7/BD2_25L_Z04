import { config } from "../config";
import { Sequelize } from "sequelize-typescript";
import { User } from "./models/user";
import { RefreshToken } from "./models/refresh-token";

const models = [User, RefreshToken];

export const database = new Sequelize({
  dialect: "postgres",
  host: config.DB_HOST,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  models: models,
  logging: config.LOGS_DB_CONSOLE === "true" ? console.log : false,
});
