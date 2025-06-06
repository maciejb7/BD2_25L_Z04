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
  ConfirmationRequest,
  confirmationRequestFields,
  EmailRequest,
  emailRequestFields,
  extractRequestFields,
  PasswordResetRequest,
  passwordResetRequestFields,
} from "../types/requests";
import {
  getEmailValidator,
  getPasswordChangeValidator,
  getUserConfirmationValidator,
  getUserDetailsValidator,
} from "../types/validators";

import { handleRequest } from "../utils/handle-request";
import { AuthService } from "../services/auth.service";
import { FileService } from "../services/file.service";
import { ValidationService } from "../services/validation.service";
import { PasswordResetLink } from "../db/models/password-reset-link";
import { DateTime } from "luxon";
import { config } from "../config";
import { EmailService } from "../services/email.service";

/**
 * Retrieves the details of the authenticated user.
 */
const getUserDetailsByUser = handleRequest(
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

/**
 * Retrieves the avatar of the authenticated user.
 */
const getUserAvatarByUser = handleRequest(
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

/**
 * Uploads a new avatar for the authenticated user.
 */
const uploadUserAvatarByUser = handleRequest(
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

/**
 * Deletes the avatar of the authenticated user.
 */
const deleteUserAvatarByUser = handleRequest(
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

/**
 * Changes a specific field of the authenticated user's details.
 */
const changeDetailsFieldByUser = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } =
      AuthService.extractAuthenticatedUserPayload(req);

    const loggerMetaData = {
      service: "change_user_details",
      nickname: userNickname,
    };

    const { name, value } =
      await extractRequestFields<ChangeUserDetailsRequest>(
        req.body,
        changeUserDetailsRequestFields,
        loggerMetaData,
      );

    let updatedValue;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    const validator = getUserDetailsValidator(loggerMetaData);

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
      loggerMetaData,
    );

    res.status(200).json({
      message: `Zmiana dokonana pomyślnie.`,
    });
  },
);

/**
 * Deletes the authenticated user's account.
 */
const deleteAccountByUser = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: "delete_account_user",
      nickname: req.user?.userNickname ?? "",
    };

    const { userNickname, userRole } =
      AuthService.extractAuthenticatedUserPayload(req);

    if (userRole === "admin") {
      logger.error(
        `Użytkownik ${userNickname} próbował usunąć swoje konto, ale jest administratorem.`,
        loggerMetaData,
      );
      res.status(403).json({
        message:
          "Nie możesz usunąć swojego konta, ponieważ jesteś administratorem.",
      });
      return;
    }

    const { nickname, password } =
      await extractRequestFields<ConfirmationRequest>(
        req.body,
        confirmationRequestFields,
        loggerMetaData,
        getUserConfirmationValidator(loggerMetaData),
      );

    if (nickname !== userNickname) {
      logger.error(
        `Nieudana próba usunięcia konta przez użytkownika ${userNickname} - podano inny nick.`,
        loggerMetaData,
      );
      res.status(400).json({
        message: "Nieprawidłowy login lub hasło.",
      });
      return;
    }

    const userToDelete = await AuthService.getAuthenticatedUser(
      nickname,
      password,
      loggerMetaData,
    );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    await userToDelete.destroy();
    logger.info(`Użytkownik ${nickname} usunął swoje konto.`, loggerMetaData);

    res.status(200).json({ message: "Usuwanie konta zakończone sukcesem." });
  },
);

/**
 * Creates a password reset link for the user.
 */
const createResetPasswordLink = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: "create_reset_password_link",
      email: req.body.email ?? "",
    };

    const { email } = await extractRequestFields<EmailRequest>(
      req.body,
      emailRequestFields,
      loggerMetaData,
      getEmailValidator(loggerMetaData),
    );

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      logger.error(
        `Nieudana próba wygenerowania linku resetującego hasło - nie znaleziono użytkownika z emailem ${email}.`,
        loggerMetaData,
      );
      res.status(404).json({
        message: "Użytkownik z podanym adresem e-mail nie istnieje.",
      });
      return;
    }

    const resetLink = await PasswordResetLink.create({
      userId: user.userId,
      expiresAt: DateTime.now().plus({ minutes: 15 }),
    });

    const resetLinkUrl = `${config.CLIENT_URL}/reset-password/${resetLink.linkId}`;

    await EmailService.sendPasswordResetEmail(
      user.nickname,
      user.email,
      resetLinkUrl,
    );

    logger.info(
      `Wygenerowano i wysłano link resetujący hasło dla użytkownika ${user.nickname}.`,
      {
        ...loggerMetaData,
        nickname: user.nickname,
      },
    );

    res.status(200).json({
      message:
        "Link resetujący hasło został wygenerowany i wysłany na podanego maila.",
      resetLinkUrl,
    });
  },
);

/**
 * Checks if a password reset link exists and is valid.
 */
const checkIfPasswordResetLinkExists = handleRequest(
  async (req: Request, res: Response) => {
    const { passwordResetLinkId } = req.params;

    ValidationService.checkIfUUIDIsValid(
      passwordResetLinkId,
      "Link do resetowania hasła",
    );

    const passwordResetLink =
      await PasswordResetLink.findByPk(passwordResetLinkId);

    if (!passwordResetLink) {
      res.status(404).json({
        message: "Nie znaleziono linku resetującego hasło.",
      });
      return;
    }

    if (DateTime.fromJSDate(passwordResetLink.expiresAt) < DateTime.now()) {
      res.status(400).json({
        message: "Link resetujący hasło wygasł.",
      });
      return;
    }

    res.status(200).json({
      message: "Link resetujący hasło jest ważny.",
    });
  },
);

/**
 * Resets the user's password using the provided reset link and new password.
 */
const resetUserPasswordByUser = handleRequest(
  async (req: Request, res: Response) => {
    const loggerMetaData = {
      service: "reset_user_password",
    };

    const { passwordResetLinkId, password } =
      await extractRequestFields<PasswordResetRequest>(
        req.body,
        passwordResetRequestFields,
        loggerMetaData,
        getPasswordChangeValidator(loggerMetaData),
      );

    const passwordResetLink =
      await PasswordResetLink.findByPk(passwordResetLinkId);

    if (!passwordResetLink) {
      logger.error(
        `Nieudana próba resetowania hasła - nie znaleziono linku resetującego o ID ${passwordResetLinkId}.`,
        loggerMetaData,
      );
      res.status(404).json({
        message: "Nie znaleziono linku resetującego hasło.",
      });
      return;
    }

    const user = await User.findByPk(passwordResetLink.userId);

    if (!user) {
      logger.error(
        `Nieudana próba resetowania hasła - nie znaleziono użytkownika powiązanego z linkiem resetującym o ID ${passwordResetLinkId}.`,
        loggerMetaData,
      );
      res.status(404).json({
        message: "Nie znaleziono użytkownika powiązanego z tym linkiem.",
      });
      return;
    }

    if (DateTime.fromJSDate(passwordResetLink.expiresAt) < DateTime.now()) {
      logger.error(
        `Nieudana próba resetowania hasła - link resetujący o ID ${passwordResetLinkId} wygasł.`,
        { ...loggerMetaData, nickname: user.nickname },
      );
      res.status(400).json({
        message: "Link resetujący hasło wygasł.",
      });
      return;
    }

    const isPasswordTheSame = await bcrypt.compare(password, user.password);

    if (isPasswordTheSame) {
      logger.error(`Nieudana próba resetowania hasła - podano to samo hasło.`, {
        ...loggerMetaData,
        nickname: user.nickname,
      });
      res.status(400).json({
        message: "Nowe hasło nie może być takie samo jak stare.",
      });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);
    user.password = hashedNewPassword;
    await user.save();
    await passwordResetLink.destroy();
    logger.info(
      `Użytkownik ${user.nickname} zresetował swoje hasło.`,
      loggerMetaData,
    );
    res.status(200).json({
      message: "Hasło zostało zresetowane pomyślnie. Możesz się zalogować.",
      userNickname: user.nickname,
    });
  },
);

/**
 * Changes the user's password.
 */
const changeUserPasswordbyUser = handleRequest(
  async (req: Request, res: Response) => {
    const { userNickname } = AuthService.extractAuthenticatedUserPayload(req);

    const loggerMetaData = {
      service: "change_password_user",
      nickname: userNickname,
    };

    const { oldPassword, newPassword } =
      await extractRequestFields<ChangePasswordRequest>(
        req.body,
        changePasswordRequestFields,
        loggerMetaData,
        getPasswordChangeValidator(loggerMetaData),
      );

    const user = await AuthService.getAuthenticatedUser(
      userNickname,
      oldPassword,
      loggerMetaData,
    );

    const isPasswordTheSame = await bcrypt.compare(newPassword, user.password);

    if (isPasswordTheSame) {
      logger.error(
        `Nieudana próba zmiany hasła - Podano to samo hasło.`,
        loggerMetaData,
      );
      res.status(400).json({
        message: "Nowe hasło nie może być takie samo jak stare.",
      });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    logger.info(
      `Użytkownik ${userNickname} zmienił swoje hasło.`,
      loggerMetaData,
    );

    res.status(200).json({
      message: "Hasło zostało zmienione.",
    });
  },
);

export const UserController = {
  getUserDetailsByUser,
  getUserAvatarByUser,
  uploadUserAvatarByUser,
  deleteUserAvatarByUser,
  changeDetailsFieldByUser,
  changeUserPasswordbyUser,
  createResetPasswordLink,
  checkIfPasswordResetLinkExists,
  resetUserPasswordByUser,
  deleteAccountByUser,
};
