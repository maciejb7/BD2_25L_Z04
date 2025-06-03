import { Request, Response } from "express";
import { User } from "../db/models/user";
import fs from "fs";

import bcrypt from "bcrypt";

import logger from "../logger";

import {
  ChangePasswordRequest,
  changePasswordRequestFields,
  ChangeUserDetailsRequest,
  changeUserDetailsRequestFields,
  extractRequestFields,
} from "../types/requests";
import {
  getPasswordChangeValidator,
  getUserDetailsValidator,
} from "../types/validators";

import { handleRequest } from "../utils/handle-request";
import { AuthService } from "../services/auth.service";
import { FileService } from "../services/file.service";
import { ValidationService } from "../services/validation.service";

export const getUserInfo = handleRequest(
  async (req: Request, res: Response) => {
    const { userId } = AuthService.extractAuthenticatedUserPayload(req);

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  },
);

export const getUserAvatar = handleRequest(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      res.status(404).json({
        message: "Nie znaleziono awatara użytkownika.",
      });
      return;
    }

    res.sendFile(avatarFilePath);
  },
);

export const uploadUserAvatar = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } =
      AuthService.extractAuthenticatedUserPayload(req);
    const avatarFile = req.file!;

    await FileService.checkIfImageHasCorrectSize(
      avatarFile,
      { service: "user_upload_avatar", nickname: userNickname },
      128,
      128,
      1024,
      1024,
      true,
    );

    const avatarFilePath = FileService.getUserAvatarPath(userId);
    await fs.promises.writeFile(avatarFilePath, avatarFile.buffer);

    logger.info(`Użytkownik ${userNickname} zmienił swoje zdjęcie profilowe.`, {
      service: "user_upload_avatar",
      nickname: userNickname,
    });

    res.status(200).json({
      message: "Zdjęcie profilowe zaktualizowane pomyślnie.",
    });
  },
);

export const deleteUserAvatar = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } =
      AuthService.extractAuthenticatedUserPayload(req);
    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      res.status(404).json({
        message: "Nie posiadasz avatara do usunięcia.",
      });
      return;
    }

    await fs.promises.unlink(avatarFilePath);
    logger.info(`Użytkownik ${userNickname} usunął swoje zdjęcie profilowe.`, {
      service: "user-delete-avatar",
      nickname: userNickname,
    });
    res.status(200).json({
      message: "Zdjęcie profilowe zostało pomyślnie usunięte.",
    });
  },
);

export const changeUserInfoField = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } =
      AuthService.extractAuthenticatedUserPayload(req);
    const { name, value } =
      await extractRequestFields<ChangeUserDetailsRequest>(
        req.body,
        changeUserDetailsRequestFields,
        {
          service: "change_user_details",
          nickname: userNickname,
        },
      );

    let updatedValue;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    const validator = getUserDetailsValidator({
      service: "change_user_details",
      nickname: userNickname,
    });

    if (!validator[name]) {
      res.status(400).json({ message: "Nieprawidłowe pole do zmiany." });
      return;
    }

    if (name === "password") {
      res.status(400).json({
        message: "Nie można zmienić hasła w ten sposób. Użyj innej metody.",
      });
      return;
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
      `Użytkownik ${userNickname} zmienił informacje o sobie - ${name} na ${value}.`,
      {
        service: "change_user_details",
        nickname: userNickname,
      },
    );

    res.status(200).json({
      message: `Zmiana dokonana pomyślnie.`,
    });
  },
);

export const changeUserPassword = handleRequest(
  async (req: Request, res: Response) => {
    const { userNickname } = AuthService.extractAuthenticatedUserPayload(req);
    const { oldPassword, newPassword } =
      await extractRequestFields<ChangePasswordRequest>(
        req.body,
        changePasswordRequestFields,
        {
          service: "change_password_user",
          nickname: userNickname,
        },
        getPasswordChangeValidator({
          service: "change_password_user",
          nickname: userNickname,
        }),
      );

    const user = await AuthService.getAuthenticatedUser(
      userNickname,
      oldPassword,
      {
        service: "change_password_user",
        nickname: userNickname,
      },
    );

    const isPasswordTheSame = await bcrypt.compare(newPassword, user.password);

    if (isPasswordTheSame) {
      logger.error(`Nieudana próba zmiany hasła - Podano to samo hasło.`, {
        service: "change_password_user",
        nickname: userNickname,
      });
      res.status(400).json({
        message: "Nowe hasło nie może być takie samo jak stare.",
      });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    logger.info(`Użytkownik ${userNickname} zmienił swoje hasło.`, {
      service: "change_password_user",
      nickname: userNickname,
    });

    res.status(200).json({
      message: "Hasło zostało zmienione.",
    });
  },
);

export const UserController = {
  getUserInfo,
  getUserAvatar,
  uploadUserAvatar,
  deleteUserAvatar,
  changeUserInfoField,
  changeUserPassword,
};
