import express from "express";
import { friendsAppDatabase } from "./db/database";
import logger from "./logger";
import { config } from "./config";

const startServer = async () => {
  try {
    await friendsAppDatabase.authenticate();
    await friendsAppDatabase.sync({ force: false });
    logger.info("Połączono z bazą danych.");

    const app = express();
    const appPort = config.SERVER_PORT;

    app.use(express.json());

    app.listen(appPort, () => {
      logger.info(`Uruchomiono serwer na porcie ${appPort}`);
    });
  } catch (error) {
    logger.error("Błąd podczas łączenia z bazą danych: ", error);
    process.exit(1);
  }
};

startServer();
