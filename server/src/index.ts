import express from "express";
import cookieParser from "cookie-parser";
import { database } from "./db/database";
import logger from "./logger";
import { config } from "./config";
import authRouter from "./routers/auth-router";

const startServer = async () => {
  try {
    await database.authenticate();
    await database.sync({ force: false });
    logger.info("Połączono z bazą danych.");

    const app = express();
    const appPort = config.SERVER_PORT;

    app.use(express.json());
    app.use(cookieParser());
    addRouters(app);

    app.listen(appPort, () => {
      logger.info(`Uruchomiono serwer na porcie ${appPort}`);
    });
  } catch (error) {
    logger.error("Błąd podczas łączenia z bazą danych: ", error);
    process.exit(1);
  }
};

const addRouters = (app: express.Application) => {
  app.use("/api/auth", authRouter);
};

startServer();
