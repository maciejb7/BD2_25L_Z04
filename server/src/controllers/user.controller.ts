import { Request, Response } from "express";
import { User } from "../db/models/user";
import path from "path";
import fs from "fs";
import AuthService from "../services/auth.service";
import { ValidationService } from "../services/validation.service";
import bcrypt from "bcrypt";
import {
  FieldValidationError,
  FileUploadError,
  InvalidPasswordError,
  UserNotFoundError,
} from "../errors/errors";
import logger from "../logger";
import { userValidator } from "../utils/validators";
import { FileService } from "../services/file.service";

const avatarsPath = path.join(__dirname, "..", "..", "uploads", "avatars");

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
    const userId = req.user?.userId;

    const avatarFilePath = path.join(avatarsPath, `${userId}.jpg`);

    if (!fs.existsSync(avatarFilePath)) {
      res.status(404).json({
        message: "Nie znaleziono awatara użytkownika.",
      });
      return;
    }

    res.sendFile(avatarFilePath);
  }

  /**
   * Uploads a new avatar for the currently authenticated user.
   * Use only with "authenticateUser" and "uploadSingleFile" middlewares.
   */
  static async uploadUserAvatar(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const userNickname = req.user?.userNickname;
    const avatarFile = req.file!;

    try {
      await FileService.hasImageCorrectSize(
        avatarFile,
        128,
        128,
        1024,
        1024,
        true,
      );

      const avatarFilePath = path.join(avatarsPath, `${userId}.jpg`);

      await fs.promises.mkdir(avatarsPath, { recursive: true });
      await fs.promises.writeFile(avatarFilePath, avatarFile.buffer);

      logger.info(
        `Użytkownik ${userNickname} zmienił swoje zdjęcie profilowe.`,
        {
          service: "user-upload-avatar",
          nickname: userNickname,
        },
      );

      res.status(200).json({
        message: "Zdjęcie profilowe zaktualizowane pomyślnie.",
      });
    } catch (error) {
      if (error instanceof FileUploadError) {
        logger.error(`Błąd przesyłania awatara - ${error.message}`, {
          service: "user-upload-avatar",
          nickname: userNickname,
        });
        res.status(error.statusCode).json({ message: error.message });
        return;
      }

      logger.error(`Nieudana próba przesłania awatara`, error, {
        service: "user-upload-avatar",
        nickname: userNickname,
      });
      res.status(500).json({
        message:
          "Wystąpił nieznany błąd podczas przesyłania awatara. Skontaktuj się z administratorem.",
      });
      return;
    }
  }

  static async deleteUserAvatar(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const userNickname = req.user?.userNickname;
    const avatarFilePath = path.join(avatarsPath, `${userId}.jpg`);
    if (!fs.existsSync(avatarFilePath)) {
      res.status(404).json({
        message: "Nie posiadasz avatara do usunięcia.",
      });
      return;
    }
    try {
      await fs.promises.unlink(avatarFilePath);
      logger.info(
        `Użytkownik ${userNickname} usunął swoje zdjęcie profilowe.`,
        {
          service: "user-delete-avatar",
          nickname: userNickname,
        },
      );
      res.status(200).json({
        message: "Zdjęcie profilowe zostało pomyślnie usunięte.",
      });
    } catch (error) {
      logger.error(`Nieudana próba usunięcia awatara `, error, {
        service: "user-delete-avatar",
        nickname: userNickname,
      });
      res.status(500).json({
        message:
          "Wystąpił nieznany błąd podczas usuwania awatara. Skontaktuj się z administratorem.",
      });
      return;
    }
  }

  /**
   * Changes a field of informations of the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async changeUserInfoField(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const name = req.body.name.trim() ?? "";
    let value = req.body.value.trim() ?? "";

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    try {
      if (!userValidator[name]) {
        res.status(400).json({ message: "Nieprawidłowe pole do zmiany." });
        return;
      }

      if (name === "password") {
        res.status(400).json({
          message: "Nie można zmienić hasła w ten sposób. Użyj innej metody.",
        });
        return;
      }

      if (name === "gender") {
        if (value === "Mężczyzna") value = "male";
        if (value === "Kobieta") value = "female";
      }

      await userValidator[name](value);

      if (name === "birthDate") {
        value = ValidationService.formatToDateTime(value).toJSDate();
      }

      await user.update({ [name]: value });
      await user.save();
      res.status(200).json({
        message: `Zmiana dokonana pomyślnie.`,
      });
    } catch (error) {
      if (error instanceof FieldValidationError) {
        logger.error(
          `Błąd walidacji podczas zmiany pola ${name} - ${error.message}`,
          {
            service: "user-change-info",
            userId: userId,
          },
        );
        res.status(error.statusCode).json({
          message: error.message,
        });
        return;
      } else {
        logger.error(`Nieudana próba zmiany pola `, error, {
          service: "user-change-info",
          userId: userId,
        });
        res.status(500).json({
          message:
            "Wystąpił nieznany błąd podczas zmiany pola. Skontaktuj się z administratorem.",
        });
        return;
      }
    }
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

      userValidator.password(newPassword);

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
