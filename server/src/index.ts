import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { database } from "./db/database";
import logger from "./logger";
import { config } from "./config";
import authRouter from "./routers/auth.router";
import matchPreferenceRouter from "./routers/match-preference.router";
import recommendationRouter from "./routers/recommendation.router";
import userInteractionRouter from "./routers/user-interaction.router";
import { MatchPreferenceService } from "./services/match-preference.service";
import questionRouter from "./routers/question.router";

const startServer = async () => {
  try {
    await database.authenticate();
    await database.sync({ force: false });
    logger.info("Połączono z bazą danych.");

    await MatchPreferenceService.initializeMatchTypes();
    logger.info("Zainicjalizowano typy dopasowań.");

    const app = express();
    const appPort = config.SERVER_PORT;

    app.use(express.json());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
      }),
    );
    app.use(cookieParser());
    addRouters(app);

    app.listen(appPort, () => {
      logger.info(`Uruchomiono serwer na porcie ${appPort}.`);
    });
  } catch (error) {
    logger.error("Błąd podczas łączenia z bazą danych: ", error);
    process.exit(1);
  }
};

const addRouters = (app: express.Application) => {
  app.use("/api/auth", authRouter);
  app.use("/api/match-preferences", matchPreferenceRouter);
  app.use("/api/recommendations", recommendationRouter);
  app.use("/api/interactions", userInteractionRouter);
  app.use("/api/questions", questionRouter);
};

startServer();
