import fs from "fs/promises";
import { avatarsPath } from "../services/file.service";
import path from "path";
import { User } from "../db/models/user";
import cron from "node-cron";
import logger from "../logger";
import { services } from "../constants/services";

const deleteAvatars = async () => {
  try {
    const files = await fs.readdir(avatarsPath);

    for (const file of files) {
      const ext = path.extname(file);
      const userId = path.basename(file, ext);

      const userExists = await User.findByPk(userId);

      if (!userExists) {
        const filePath = path.join(avatarsPath, file);
        await fs.unlink(filePath);
        logger.info(`Usunięto zdjęcie profilowe dla ID: ${userId}`, {
          service: services.deleteAvatars,
        });
      }
    }
  } catch (error) {
    logger.error("Błąd podczas usuwania zdjęć profilowych:", {
      error,
      service: services.deleteAvatars,
    });
  }
};

export const scheduleDeleteAvatars = () => {
  cron.schedule("*/1 * * * *", () => deleteAvatars());
};
