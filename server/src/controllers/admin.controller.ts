import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request";
import { ValidationService } from "../services/validation.service";
import { RequestService } from "../services/request.service";
import { Role, User } from "../db/models/user";
import { ForbiddenActionError, UserNotFoundError } from "../errors/errors";
import { services } from "../constants/services";
import { Session } from "../db/models/session";
import logger from "../logger";
import { UserBanRequest, userBanRequestFields } from "../types/requests";
import { getUserBanValidator } from "../types/validators";
import { AccountBan } from "../db/models/account-ban";
import { EmailService } from "../services/email.service";
import { DateTime } from "luxon";

const getUserDetailsByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const userId = await RequestService.extractPathParameter(req, "userId", {
      service: services.getUserDetailsByAdmin,
    });
    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const user = await User.findByPk(userId);

    if (!user) {
      throw new UserNotFoundError({
        metaData: {
          service: services.getUserDetailsByAdmin,
          userId: userId,
        },
      });
    }

    res.status(200).json({ user: user.toJSONAdmin() });
  },
);

const getUsersDetailsByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const users = await User.findAll({ include: [Session] });

    if (!users || users.length === 0) {
      throw new UserNotFoundError({
        message: "Nie znaleziono żadnych użytkowników.",
        metaData: {
          service: services.getUsersDetailsByAdmin,
        },
        loggerMessage: "Brak użytkowników w bazie danych.",
      });
    }

    res.status(200).json({ users: users.map((user) => user.toJSONAdmin()) });
  },
);

const deleteUserAccountByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetadata = {
      service: services.deleteAccountByAdmin,
    };

    const { userNickname } = RequestService.extractAuthenticatedUserPayload(
      req,
      loggerMetadata,
    );
    const userId = await RequestService.extractPathParameter(
      req,
      "userId",
      loggerMetadata,
    );

    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const user = await User.findByPk(userId);

    if (!user) {
      throw new UserNotFoundError({
        metaData: {
          ...loggerMetadata,
          adminNickname: userNickname,
          userToDeleteId: userId,
        },
      });
    }

    if (user.role === "admin") {
      throw new ForbiddenActionError({
        message: "Nie możesz usunąć konta administratora.",
        metaData: {
          ...loggerMetadata,
          adminNickname: userNickname,
          userToDeleteId: userId,
        },
        loggerMessage: `Administrator ${userNickname} próbował usunąć konto administratora ${user.nickname}.`,
      });
    }

    await user.destroy();

    logger.info(
      `Administrator ${userNickname} usunął konto użytkownika ${user.nickname}.`,
      {
        ...loggerMetadata,
        adminNickname: userNickname,
        deletedUserId: userId,
        deletedUserNickname: user.nickname,
      },
    );

    res.status(200).json({
      message: "Konto użytkownika zostało pomyślnie usunięte.",
      userId: userId,
    });
  },
);

const banUserAccount = handleRequest(async (req: Request, res: Response) => {
  const loggerMetadata = {
    service: services.banUserAccount,
  };

  const { userId, userNickname } =
    RequestService.extractAuthenticatedUserPayload(req, loggerMetadata);

  const { userToBanId, reason } =
    await RequestService.extractRequestFields<UserBanRequest>(
      req.body,
      userBanRequestFields,
      loggerMetadata,
      getUserBanValidator(loggerMetadata),
    );

  const userToBan = await User.findByPk(userToBanId);

  if (!userToBan) {
    throw new UserNotFoundError({
      metaData: {
        ...loggerMetadata,
        userId: userId,
      },
    });
  }

  if (userToBan.role === "admin") {
    throw new ForbiddenActionError({
      message: "Nie możesz zbanować konta administratora.",
      metaData: {
        ...loggerMetadata,
        userId: userId,
      },
      loggerMessage: `Próba zbanowania konta administratora ${userToBan.nickname} przez użytkownika ${userNickname}.`,
    });
  }

  userToBan.role = Role.BANNED;
  await userToBan.save();

  await AccountBan.upsert({
    givenTo: userToBan.userId,
    givenBy: userId,
    reason: reason,
  });

  await EmailService.sendBanEmail(
    userToBan.email,
    userToBan.nickname,
    userNickname,
    DateTime.now().toISODate(),
    reason,
  );

  logger.info(
    `Użytkownik ${userNickname} zbanował konto użytkownika ${userToBan.nickname}.`,
    {
      ...loggerMetadata,
      userId: userId,
      userNickname: userNickname,
      userToBanId: userToBan.userId,
      userToBanNickname: userToBan.nickname,
      reason: reason,
    },
  );

  res.status(200).json({
    message: "Konto użytkownika zostało pomyślnie zbanowane.",
    userToBanId: userToBan.userId,
    userToBanNickname: userToBan.nickname,
  });
});

const unbanUserAccount = handleRequest(async (req: Request, res: Response) => {
  const loggerMetadata = {
    service: services.unbanUserAccount,
  };
  const { userId, userNickname } =
    RequestService.extractAuthenticatedUserPayload(req, loggerMetadata);
  const userToUnbanId = await RequestService.extractPathParameter(
    req,
    "userToUnbanId",
    loggerMetadata,
  );
  ValidationService.checkIfUUIDIsValid(userToUnbanId, "ID użytkownika");

  const userToUnban = await User.findByPk(userToUnbanId);

  if (!userToUnban) {
    throw new UserNotFoundError({
      metaData: {
        ...loggerMetadata,
        userId: userId,
      },
    });
  }

  const ban = await AccountBan.findOne({
    where: { givenTo: userToUnban.userId },
  });

  if (!ban) {
    throw new UserNotFoundError({
      message: "Użytkownik nie jest zbanowany.",
      metaData: {
        ...loggerMetadata,
        userId: userId,
        userToUnbanId: userToUnban.userId,
      },
    });
  }

  userToUnban.role = Role.USER;
  await userToUnban.save();
  await ban.destroy();

  await EmailService.sendUnbanEmail(
    userToUnban.email,
    userToUnban.nickname,
    userNickname,
  );

  logger.info(
    `Użytkownik ${userNickname} odblokował konto użytkownika ${userToUnban.nickname}.`,
    {
      ...loggerMetadata,
      userId: userId,
      userNickname: userNickname,
      userToUnbanId: userToUnban.userId,
      userToUnbanNickname: userToUnban.nickname,
    },
  );
  res.status(200).json({
    message: "Konto użytkownika zostało pomyślnie odblokowane.",
    userToUnbanId: userToUnban.userId,
    userToUnbanNickname: userToUnban.nickname,
  });
});

export const AdminController = {
  getUserDetailsByAdmin,
  getUsersDetailsByAdmin,
  deleteUserAccountByAdmin,
  banUserAccount,
  unbanUserAccount,
};
