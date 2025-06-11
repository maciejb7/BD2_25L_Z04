import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request";
import { ValidationService } from "../services/validation.service";
import { RequestService } from "../services/request.service";
import { Role, User } from "../db/models/user";
import fs from "fs";
import {
  FieldValidationError,
  ForbiddenActionError,
  UserAvatarNotFoundError,
  UserNotFoundError,
} from "../errors/errors";
import { services } from "../constants/services";
import { Session } from "../db/models/session";
import logger from "../logger";
import {
  ChangeUserDetailsRequest,
  changeUserDetailsRequestFields,
  UserBanRequest,
  userBanRequestFields,
} from "../types/requests";
import {
  getUserBanValidator,
  getUserDetailsValidator,
} from "../types/validators";
import { AccountBan } from "../db/models/account-ban";
import { EmailService } from "../services/email.service";
import { DateTime } from "luxon";
import { FileService } from "../services/file.service";

const getUserDetailsByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const userId = await RequestService.extractPathParameter(req, "userId", {
      service: services.getUserDetailsByAdmin,
    });
    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const user = await User.findByPk(userId, { include: [Session] });

    if (!user) {
      throw new UserNotFoundError({
        metaData: {
          service: services.getUserDetailsByAdmin,
          userId: userId,
        },
        makeLog: false,
      });
    }

    res.status(200).json({ user: user.toJSONAdmin() });
  },
);

const getUsersDetailsByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      throw new UserNotFoundError({
        message: "Nie znaleziono żadnych użytkowników.",
        makeLog: false,
      });
    }

    res.status(200).json({ users: users.map((user) => user.toJSONAdmin()) });
  },
);

const getUserBanByAdmin = handleRequest(async (req: Request, res: Response) => {
  const bannedUserId = await RequestService.extractPathParameter(
    req,
    "bannedUserId",
  );

  ValidationService.checkIfUUIDIsValid(
    bannedUserId,
    "ID zbanowanego użytkownika",
  );

  const ban = await AccountBan.findOne({
    where: { givenTo: bannedUserId },
  });

  if (!ban) {
    throw new ForbiddenActionError({
      message: "Użytkownik nie jest zbanowany.",
      makeLog: false,
    });
  }

  const bannedBy = await User.findByPk(ban.givenBy);

  res.status(200).json({
    givenBy: bannedBy?.nickname || "Nieznany",
    reason: ban.reason,
    givenAt: DateTime.fromJSDate(ban.createdAt).toISODate(),
  });
});

const getUserAvatarByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const userId = await RequestService.extractPathParameter(req, "userId", {
      service: services.getUserAvatarByAdmin,
    });

    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      throw new UserAvatarNotFoundError({
        makeLog: false,
      });
    }

    res.sendFile(avatarFilePath);
  },
);

const uploadUserAvatarByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: services.uploadUserAvatarByAdmin,
    };
    const { userNickname } = RequestService.extractAuthenticatedUserPayload(
      req,
      loggerMetaData,
    );
    const userId = await RequestService.extractPathParameter(
      req,
      "userId",
      loggerMetaData,
    );
    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const avatarFile = req.file!;

    await FileService.checkIfImageHasCorrectSize(
      avatarFile,
      { service: services.uploadUserAvatarByUser, nickname: userNickname },
      128,
      128,
      1024,
      1024,
      true,
    );

    const avatarFilePath = FileService.getUserAvatarPath(userId);
    await fs.promises.writeFile(avatarFilePath, avatarFile.buffer);

    logger.info(
      `Administrator ${userNickname} zmienił zdjęcie profilowe użytkownika o ID ${userId}.`,
      {
        ...loggerMetaData,
        userNickname: userNickname,
        updatedUserId: userId,
      },
    );

    res.status(200).json({
      message: "Zdjęcie profilowe użytkownika zaktualizowane pomyślnie.",
    });
  },
);

const deleteUserAvatarByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: services.deleteUserAvatarByAdmin,
    };

    const { userNickname } = RequestService.extractAuthenticatedUserPayload(
      req,
      loggerMetaData,
    );

    const userId = await RequestService.extractPathParameter(
      req,
      "userId",
      loggerMetaData,
    );

    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      throw new UserAvatarNotFoundError({
        metaData: {
          service: services.deleteUserAvatarByAdmin,
          nickname: userNickname,
        },
      });
    }

    await fs.promises.unlink(avatarFilePath);

    logger.info(
      `Administrator ${userNickname} usunął avatar użytkownika o ID ${userId}.`,
      {
        ...loggerMetaData,
        userNickname: userNickname,
        deletedUserId: userId,
      },
    );

    res.status(200).json({
      message: "Zdjęcie profilowe użytkownika usunięte pomyślnie.",
      userId: userId,
    });
  },
);

const deleteUserAccountByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: services.deleteAccountByAdmin,
    };

    const { userNickname } = RequestService.extractAuthenticatedUserPayload(
      req,
      loggerMetaData,
    );
    const userId = await RequestService.extractPathParameter(
      req,
      "userId",
      loggerMetaData,
    );

    ValidationService.checkIfUUIDIsValid(userId, "ID użytkownika");

    const user = await User.findByPk(userId);

    if (!user) {
      throw new UserNotFoundError({
        metaData: {
          ...loggerMetaData,
          adminNickname: userNickname,
          userToDeleteId: userId,
        },
      });
    }

    if (user.role === "admin") {
      throw new ForbiddenActionError({
        message: "Nie możesz usunąć konta administratora.",
        metaData: {
          ...loggerMetaData,
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
        ...loggerMetaData,
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
  const loggerMetaData = {
    service: services.banUserAccount,
  };

  const { userId, userNickname } =
    RequestService.extractAuthenticatedUserPayload(req, loggerMetaData);

  const { userToBanId, reason } =
    await RequestService.extractRequestFields<UserBanRequest>(
      req.body,
      userBanRequestFields,
      loggerMetaData,
      getUserBanValidator(loggerMetaData),
    );

  const userToBan = await User.findByPk(userToBanId);

  if (!userToBan) {
    throw new UserNotFoundError({
      metaData: {
        ...loggerMetaData,
        userId: userId,
      },
    });
  }

  if (userToBan.role === "admin") {
    throw new ForbiddenActionError({
      message: "Nie możesz zbanować konta administratora.",
      metaData: {
        ...loggerMetaData,
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
      ...loggerMetaData,
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
  const loggerMetaData = {
    service: services.unbanUserAccount,
  };
  const { userId, userNickname } =
    RequestService.extractAuthenticatedUserPayload(req, loggerMetaData);
  const userToUnbanId = await RequestService.extractPathParameter(
    req,
    "userToUnbanId",
    loggerMetaData,
  );
  ValidationService.checkIfUUIDIsValid(userToUnbanId, "ID użytkownika");

  const userToUnban = await User.findByPk(userToUnbanId);

  if (!userToUnban) {
    throw new UserNotFoundError({
      metaData: {
        ...loggerMetaData,
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
        ...loggerMetaData,
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
      ...loggerMetaData,
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

export const changeDetailsFieldByAdmin = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: services.changeUserDetailsByAdmin,
    };

    const { userNickname } = RequestService.extractAuthenticatedUserPayload(
      req,
      loggerMetaData,
    );

    const userId = await RequestService.extractPathParameter(
      req,
      "userId",
      loggerMetaData,
    );

    const { name, value } =
      await RequestService.extractRequestFields<ChangeUserDetailsRequest>(
        req.body,
        changeUserDetailsRequestFields,
        loggerMetaData,
      );

    let updatedValue;

    const user = await User.findByPk(userId);

    if (!user) {
      throw new UserNotFoundError({
        metaData: loggerMetaData,
      });
    }

    const validator = getUserDetailsValidator(loggerMetaData);

    if (!validator[name]) {
      throw new FieldValidationError({
        message: `Nieprawidłowa nazwa pola: ${name}.`,
        metaData: {
          ...loggerMetaData,
          adminNickname: userNickname,
          userId: userId,
        },
        loggerMessage: `Administrator ${userNickname} próbował zmienić nieistniejące pole: ${name}.`,
      });
    }

    if (name === "password") {
      throw new ForbiddenActionError({
        message: "Nie można zmienić hasła w ten sposób. Użyj innej metody.",
        metaData: {
          ...loggerMetaData,
          adminNickname: userNickname,
          userId: userId,
        },
        loggerMessage: `Administrator ${userNickname} próbował zmienić hasło przez zwykłą zmianę informacji o użytkowniku, co jest niedozwolone.`,
      });
    }

    await validator[name](value);

    if (name === "birthDate") {
      updatedValue = ValidationService.getDateTimeFromDate(value).toJSDate();
    } else {
      updatedValue = value;
    }

    await user.update({ [name]: updatedValue });
    await user.save();

    logger.info(
      `Administrator ${userNickname} zmienił pole ${name} użytkownika o ID ${userId} na wartość: ${updatedValue}.`,
      {
        ...loggerMetaData,
        adminNickname: userNickname,
        userId: userId,
        updatedField: name,
        updatedValue: updatedValue,
      },
    );
    res.status(200).json({
      message: `Dane użytkownika zostały pomyślnie zaktualizowane.`,
      userId: userId,
      updatedField: name,
      updatedValue: updatedValue,
    });
  },
);

export const AdminController = {
  getUserDetailsByAdmin,
  getUsersDetailsByAdmin,
  getUserAvatarByAdmin,
  uploadUserAvatarByAdmin,
  deleteUserAvatarByAdmin,
  getUserBanByAdmin,
  changeDetailsFieldByAdmin,
  deleteUserAccountByAdmin,
  banUserAccount,
  unbanUserAccount,
};
