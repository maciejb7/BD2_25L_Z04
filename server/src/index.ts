import express, { Express } from "express";
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
import hobbyRouter from "./routers/hobby.router";
import { HobbyService } from "./services/hobby.service";
import musicRouter from "./routers/music.router";
import locationRouter from "./routers/location.router";
import path from "path";
import fs from "fs";
import userRouter from "./routers/user.router";
import { errorHandler } from "./middlewares/error.handler";
import helmet from "helmet";
import hpp from "hpp";
import adminRouter from "./routers/admin.router";
import { scheduleDeleteExpiredPasswordResetLinks } from "./tasks/delete-expired-password-resets";
import { scheduleDeleteUnactiveExpiredAccounts } from "./tasks/delete-expired-unactive-accounts";

export const connectToDatabase = async () => {
  try {
    await database.authenticate();
    await database.sync({ force: config.TEST_MODE });
    logger.info("Połączono z bazą danych.");
  } catch (error) {
    logger.error("Błąd podczas łączenia z bazą danych: ", error);
    process.exit(1);
  }
};

export const initializeExpress = async (): Promise<Express> => {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(hpp());

  app.use(cookieParser());

  app.use(express.json());

  addRouters(app);

  app.use(errorHandler);

  return app;
};

const onStart = async () => {
  initializeUploadsDirectory();

  await MatchPreferenceService.initializeMatchTypes();
  logger.info("Zainicjalizowano typy dopasowań.");

  await HobbyService.initializeHobbyData();
  logger.info("Zainicjalizowano dane hobby.");

  scheduleCronTasks();
};

const startExpress = (app: Express) => {
  const appPort = config.SERVER_PORT;
  app.listen(appPort, () => {
    logger.info(`Uruchomiono serwer na porcie ${appPort}.`);
  });
};

const startServer = async () => {
  await connectToDatabase();
  const app = await initializeExpress();
  await onStart();
  startExpress(app);
};

const addRouters = (app: express.Application) => {
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/match-preferences", matchPreferenceRouter);
  app.use("/api/recommendations", recommendationRouter);
  app.use("/api/interactions", userInteractionRouter);
  app.use("/api/questions", questionRouter);
  app.use("/api/hobbies", hobbyRouter);
  app.use("/api/music", musicRouter);
  app.use("/api/location", locationRouter);
};

/**
 * Schedules cron tasks for deleting expired password reset links
 * and deleting unactive expired accounts.
 */
const scheduleCronTasks = () => {
  scheduleDeleteExpiredPasswordResetLinks();
  scheduleDeleteUnactiveExpiredAccounts();
};

/**
 * Initializes the uploads directory and its subdirectories if they do not exist.
 */
const initializeUploadsDirectory = () => {
  const uploadsPath = path.join(__dirname, "..", "uploads");
  const avatarsPath = path.join(uploadsPath, "avatars");

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
    logger.info("Utworzono katalog z uploadami, ponieważ nie istniał.", {
      service: "uploads",
    });
  }

  if (!fs.existsSync(avatarsPath)) {
    fs.mkdirSync(avatarsPath);
    logger.info(
      "Utworzono katalog z awatarami użytkowników, ponieważ nie istniał.",
      {
        service: "uploads",
      },
    );
  }

  logger.info("Foldery uploadów wczytane pomyślnie.", {
    service: "uploads",
  });
};

if (!config.TEST_MODE) startServer();
