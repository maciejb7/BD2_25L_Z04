import { Op } from "sequelize";
import cron from "node-cron";
import { PasswordResetLink } from "../db/models/password-reset-link";
import { services } from "../constants/services";
import logger from "../logger";

const deleteExpiredPasswordResetLinks = async () => {
  try {
    const now = new Date();

    const expiredLinksCount = await PasswordResetLink.count({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    if (expiredLinksCount === 0) {
      logger.info("Brak nieaktywnych linków resetujących hasło do usunięcia.", {
        service: services.deleteUnactivePasswordResets,
      });
      return;
    }

    await PasswordResetLink.destroy({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    logger.info(
      `Usunięto ${expiredLinksCount} nieaktywnych linków resetujących hasło.`,
      { service: services.deleteUnactivePasswordResets },
    );
  } catch (error) {
    logger.error(
      "Błąd podczas usuwania nieaktywnych linków resetujących hasło.",
      {
        service: services.deleteUnactivePasswordResets,
        error,
      },
    );
  }
};

export const scheduleDeleteExpiredPasswordResetLinks = () => {
  cron.schedule("*/30 * * * *", () => deleteExpiredPasswordResetLinks());
};
