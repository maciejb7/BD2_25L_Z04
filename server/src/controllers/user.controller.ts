import { Request, Response } from "express";
import { User } from "../db/models/user";
import fs from "fs";

import { getDateTimeFromDate } from "../services/validation.service";
import bcrypt from "bcrypt";

import logger from "../logger";

import {
  checkIfImageHasCorrectSize,
  getUserAvatarPath,
  getUserAvatarPathVerified,
} from "../services/file.service";
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
import {
  extractAuthenticatedUserPayload,
  getAuthenticatedUser,
} from "../services/auth.service";

/**
 * Returns basic informations about the currently authenticated user.
 * Use only with "authenticateUser" middleware.
 */
export const getUserInfo = async (req: Request, res: Response) => {
  const { userId } = extractAuthenticatedUserPayload(req);

  const user = await User.findByPk(userId);

  if (!user) {
    res.status(404).json({ message: "Nie znaleziono użytkownika." });
    return;
  }

  res.status(200).json({
    user: user.toJSON(),
  });
};

/**
 * Returns the avatar of the currently authenticated user.
 * Use only with "authenticateUser" middleware.
 */
export const getUserAvatar = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const avatarFilePath = getUserAvatarPathVerified(userId);

  if (!avatarFilePath) {
    res.status(404).json({
      message: "Nie znaleziono awatara użytkownika.",
    });
    return;
  }

  res.sendFile(avatarFilePath);
};

/**
 * Uploads a new avatar for the currently authenticated user.
 * Use only with "authenticateUser" and "uploadSingleFile" middlewares.
 */
export const uploadUserAvatar = async (req: Request, res: Response) => {
  const { userId, userNickname } = extractAuthenticatedUserPayload(req);
  const avatarFile = req.file!;

  await checkIfImageHasCorrectSize(
    avatarFile,
    { service: "user_upload_avatar", nickname: userNickname },
    128,
    128,
    1024,
    1024,
    true,
  );

  const avatarFilePath = getUserAvatarPath(userId);
  await fs.promises.writeFile(avatarFilePath, avatarFile.buffer);

  logger.info(`Użytkownik ${userNickname} zmienił swoje zdjęcie profilowe.`, {
    service: "user_upload_avatar",
    nickname: userNickname,
  });

  res.status(200).json({
    message: "Zdjęcie profilowe zaktualizowane pomyślnie.",
  });
};

export const deleteUserAvatar = async (req: Request, res: Response) => {
  const { userId, userNickname } = extractAuthenticatedUserPayload(req);
  const avatarFilePath = getUserAvatarPathVerified(userId);

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
};

/**
 * Changes a field of informations of the currently authenticated user.
 * Use only with "authenticateUser" middleware.
 */
export const changeUserInfoField = async (req: Request, res: Response) => {
  const { userId, userNickname } = extractAuthenticatedUserPayload(req);
  const { name, value } = await extractRequestFields<ChangeUserDetailsRequest>(
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

  await validator[name](value);

  if (name === "password") {
    res.status(400).json({
      message: "Nie można zmienić hasła w ten sposób. Użyj innej metody.",
    });
    return;
  }

  if (name === "birthDate") {
    updatedValue = getDateTimeFromDate(value).toJSDate();
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
};

/**
 * Changes password of the currently authenticated user.
 * Use only with "authenticateUser" middleware.
 */
export const changeUserPassword = async (req: Request, res: Response) => {
  const { userNickname } = extractAuthenticatedUserPayload(req);
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

  const user = await getAuthenticatedUser(userNickname, oldPassword, {
    service: "change_password_user",
    nickname: userNickname,
  });

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
};
