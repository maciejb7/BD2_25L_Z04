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
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  TEST_MODE: process.env.TEST_MODE === "true",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
};
