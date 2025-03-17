import dotenv from "dotenv";

dotenv.config();

export const config = {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  SERVER_PORT: process.env.SERVER_PORT,
  LOGS_DB_CONSOLE: process.env.LOGS_DB_CONSOLE,
  LOGS_WINSTON_CONSOLE: process.env.LOGS_WINSTON_CONSOLE,
};
