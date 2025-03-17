import { config } from "../config";
import { Sequelize } from "sequelize-typescript";

export const friendsAppDatabase = new Sequelize({
  dialect: "postgres",
  host: config.DB_HOST,
  username: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  // models: [],
  logging: config.LOGS_DB_CONSOLE === "true" ? console.log : false,
});
