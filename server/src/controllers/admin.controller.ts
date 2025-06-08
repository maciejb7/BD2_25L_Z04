import { Request, Response } from "express";
import { handleRequest } from "../utils/handle-request";
import { ValidationService } from "../services/validation.service";
import { RequestService } from "../services/request.service";
import { User } from "../db/models/user";
import { UserNotFoundError } from "../errors/errors";
import { services } from "../constants/services";

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
    const users = await User.findAll();

    if (!users || users.length === 0) {
      throw new UserNotFoundError({
        message: "Nie znaleziono żadnych użytkowników.",
        metaData: {
          service: services.getUsersDetailsByAdmin,
        },
        loggerMessage: "Brak użytkowników w bazie danych.",
      });
    }

    res.status(200).json({ users: users.map((user) => user.toJSON()) });
  },
);

export const AdminController = {
  getUserDetailsByAdmin,
  getUsersDetailsByAdmin,
};
