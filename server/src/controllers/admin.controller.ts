import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request";
import { ValidationService } from "../services/validation.service";
import { RequestService } from "../services/request.service";
import { User } from "../db/models/user";
import { ForbiddenActionError, UserNotFoundError } from "../errors/errors";
import { services } from "../constants/services";
import { Session } from "../db/models/session";
import logger from "../logger";

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

export const AdminController = {
  getUserDetailsByAdmin,
  getUsersDetailsByAdmin,
  deleteUserAccountByAdmin,
};
