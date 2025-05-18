import { Request, Response } from "express";
import { User } from "../db/models/user";
import path from "path";
import fs from "fs";
import AuthService from "../services/auth.service";
import { ValidationService } from "../services/validation.service";
import bcrypt from "bcrypt";
import {
  FieldValidationError,
  InvalidPasswordError,
  UserNotFoundError,
} from "../errors/errors";
import logger from "../logger";

export class UserController {
  /**
   * Returns basic informations about the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async getUserInfo(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  }

  /**
   * Returns the avatar of the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async getUserAvatar(req: Request, res: Response): Promise<void> {
    const avatarsPath = path.join(__dirname, "..", "..", "uploads", "avatars");
    const userId = req.user?.userId;

    let avatarFilePath = path.join(avatarsPath, `${userId}.jpg`);

    if (!fs.existsSync(avatarFilePath))
      avatarFilePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "defaultAvatar.jpg",
      );

    res.sendFile(avatarFilePath);
  }

  /**
   * Changes password of the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async changeUserPassword(req: Request, res: Response): Promise<void> {
    const nickname = req.user?.userNickname ?? "";
    const { oldPassword, newPassword } = req.body;

    try {
      const user = await AuthService.authenticateUser(nickname, oldPassword);

      ValidationService.isPasswordValid(newPassword);

      const isPasswordTheSame = await bcrypt.compare(
        newPassword,
        user.password,
      );

      if (isPasswordTheSame) {
        logger.error(`Nieudana próba zmiany hasła - Podano to samo hasło.`, {
          service: "user-change-password",
          nickname: nickname,
        });
        res.status(400).json({
          message: "Nowe hasło nie może być takie samo jak stare.",
        });
        return;
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedNewPassword;
      await user.save();
      res.status(200).json({
        message: "Hasło zostało zmienione.",
      });
    } catch (error) {
      if (error instanceof FieldValidationError) {
        logger.error(`Błąd walidacji podczas zmiany hasła - ${error.message}`, {
          service: "user-change-password",
          nickname: nickname,
        });
        res.status(error.statusCode).json({
          message: error.message,
        });
      } else if (error instanceof UserNotFoundError) {
        logger.error(
          `Nieudana próba zmiany hasła - Nie znaleziono użytkownika.`,
          {
            ...error.metaData,
            service: "user-change-password",
          },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof InvalidPasswordError) {
        logger.error(`Nieudana próba zmiany hasła - Nieprawidłowe hasło.`, {
          ...error.metaData,
          service: "user-change-password",
        });
        res
          .status(error.statusCode)
          .json({ message: "Hasło jest nieprawidłowe." });
      } else {
        logger.error("Wystąpił nieznany błąd podczas zmiany hasła ", error, {
          service: "user-change-password",
        });
        res
          .status(500)
          .send(
            "Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie lub skontaktuj się z administratorem.",
          );
      }
    }
  }
}
