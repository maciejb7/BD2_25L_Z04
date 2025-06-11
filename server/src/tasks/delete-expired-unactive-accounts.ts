import { Op } from "sequelize";
import cron from "node-cron";
import { services } from "../constants/services";
import logger from "../logger";
import { AccountActivationLink } from "../db/models/account-activation-link";
import { User } from "../db/models/user";

const deleteUnactiveExpiredAccounts = async () => {
  try {
    const now = new Date();

    const expiredLinks = await AccountActivationLink.findAll({
      where: {
        expiresAt: {
          [Op.lt]: now,
        },
      },
    });

    if (expiredLinks.length === 0) {
      logger.info("Brak nieaktywnych kont do usunięcia.", {
        service: services.deleteUnactiveAccounts,
      });
      return;
    }

    const userIdsToDelete = expiredLinks.map((link) => link.userId);

    const deletedUsersCount = await User.destroy({
      where: {
        userId: {
          [Op.in]: userIdsToDelete,
        },
      },
    });

    logger.info(
      `Usunięto ${deletedUsersCount} nieaktywnych użytkowników po wygasłych linkach aktywacyjnych.`,
      { service: services.deleteUnactiveAccounts },
    );
  } catch (error) {
    logger.error("Błąd podczas usuwania nieaktywnych kont użytkowników.", {
      service: services.deleteUnactiveAccounts,
      error,
    });
  }
};

export const scheduleDeleteUnactiveExpiredAccounts = () => {
  cron.schedule("*/30 * * * *", () => deleteUnactiveExpiredAccounts());
};
