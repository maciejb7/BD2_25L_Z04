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
import { RequestService } from "../services/request.service";
import {
  FieldValidationError,
  ForbiddenActionError,
  PasswordResetLinkExpiredError,
  PasswordResetLinkNotFoundError,
  UserAvatarNotFoundError,
  UserNotFoundError,
} from "../errors/errors";
import { services } from "../constants/services";

/**
 * Retrieves the details of the authenticated user.
 */
const getUserDetailsByUser = handleRequest(
  async (req: Request, res: Response) => {
    const { userId } = RequestService.extractAuthenticatedUserPayload(req);

    const user = await User.findByPk(userId);

    if (!user) {
      throw new UserNotFoundError({
        makeLog: false,
      });
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
    const { userId } = RequestService.extractAuthenticatedUserPayload(req, {
      service: services.getUserAvatarByUser,
    });

    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      throw new UserAvatarNotFoundError({
        makeLog: false,
      });
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
      RequestService.extractAuthenticatedUserPayload(req);
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

    logger.info(`Użytkownik ${userNickname} zmienił swoje zdjęcie profilowe.`, {
      service: services.uploadUserAvatarByUser,
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
      RequestService.extractAuthenticatedUserPayload(req);
    const avatarFilePath = FileService.getUserAvatarPathVerified(userId);

    if (!avatarFilePath) {
      throw new UserAvatarNotFoundError({
        metaData: {
          service: services.deleteUserAvatarByUser,
          nickname: userNickname,
        },
      });
    }

    await fs.promises.unlink(avatarFilePath);
    logger.info(`Użytkownik ${userNickname} usunął swoje zdjęcie profilowe.`, {
      service: services.deleteUserAvatarByUser,
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
      RequestService.extractAuthenticatedUserPayload(req);

    const loggerMetaData = {
      service: services.changeUserDetailsByUser,
      nickname: userNickname,
    };

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
        metaData: loggerMetaData,
        loggerMessage: `Użytkownik ${userNickname} próbował zmienić nieistniejące pole: ${name}.`,
      });
    }

    if (name === "password") {
      throw new ForbiddenActionError({
        message: "Nie można zmienić hasła w ten sposób. Użyj innej metody.",
        metaData: loggerMetaData,
        loggerMessage: `Użytkownik ${userNickname} próbował zmienić hasło przez zwykłą zmianę informacji o sobie, co jest niedozwolone.`,
      });
    }

    if (name === "role") {
      throw new ForbiddenActionError({
        message: "Nie możesz zmienić swojej roli.",
        metaData: loggerMetaData,
        loggerMessage: `Użytkownik ${userNickname} próbował zmienić swoją rolę na: ${value}.`,
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
      service: services.deleteAccountByUser,
      nickname: req.user?.userNickname,
    };

    const { userNickname, userRole } =
      RequestService.extractAuthenticatedUserPayload(req);

    if (userRole === "admin") {
      throw new ForbiddenActionError({
        message:
          "Nie możesz usunąć swojego konta, ponieważ jesteś administratorem.",
        metaData: loggerMetaData,
        loggerMessage: `Użytkownik ${userNickname} próbował usunąć swoje konto, ale jest administratorem.`,
      });
    }

    const { nickname, password } =
      await RequestService.extractRequestFields<ConfirmationRequest>(
        req.body,
        confirmationRequestFields,
        loggerMetaData,
        getUserConfirmationValidator(loggerMetaData),
      );

    if (nickname !== userNickname) {
      throw new ForbiddenActionError({
        message: "Nieprawidłowy login lub hasło.",
        metaData: loggerMetaData,
        loggerMessage: `Nieudana próba usunięcia konta przez użytkownika ${userNickname} - podano inny nick.`,
        statusCode: 400,
      });
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

    const { email } = await RequestService.extractRequestFields<EmailRequest>(
      req.body,
      emailRequestFields,
      loggerMetaData,
      getEmailValidator(loggerMetaData),
    );

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new UserNotFoundError({
        message: "Nie znaleziono użytkownika z podanym adresem e-mail.",
        metaData: loggerMetaData,
        loggerMessage: `Nieudana próba resetowania hasła - nie znaleziono użytkownika z adresem e-mail: ${email}.`,
      });
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
    const passwordResetLinkId = await RequestService.extractPathParameter(
      req,
      "passwordResetLinkId",
    );

    ValidationService.checkIfUUIDIsValid(
      passwordResetLinkId,
      "Link do resetowania hasła",
    );

    const passwordResetLink =
      await PasswordResetLink.findByPk(passwordResetLinkId);

    if (!passwordResetLink) {
      throw new PasswordResetLinkNotFoundError({
        makeLog: false,
      });
    }

    if (DateTime.fromJSDate(passwordResetLink.expiresAt) < DateTime.now()) {
      throw new PasswordResetLinkExpiredError({
        makeLog: false,
      });
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
      service: services.resetUserPasswordByUser,
    };

    const { passwordResetLinkId, password } =
      await RequestService.extractRequestFields<PasswordResetRequest>(
        req.body,
        passwordResetRequestFields,
        loggerMetaData,
        getPasswordChangeValidator(loggerMetaData),
      );

    const passwordResetLink =
      await PasswordResetLink.findByPk(passwordResetLinkId);

    if (!passwordResetLink) {
      throw new PasswordResetLinkNotFoundError({
        metaData: {
          ...loggerMetaData,
          passwordResetLinkId: passwordResetLinkId,
        },
      });
    }

    const user = await User.findByPk(passwordResetLink.userId);

    if (!user) {
      throw new UserNotFoundError({
        metaData: {
          ...loggerMetaData,
          passwordResetLinkId: passwordResetLinkId,
        },
      });
    }

    if (DateTime.fromJSDate(passwordResetLink.expiresAt) < DateTime.now()) {
      await passwordResetLink.destroy();
      throw new PasswordResetLinkExpiredError({
        metaData: {
          ...loggerMetaData,
          passwordResetLinkId: passwordResetLinkId,
          nickname: user.nickname,
        },
      });
    }

    const isPasswordTheSame = await bcrypt.compare(password, user.password);

    if (isPasswordTheSame) {
      throw new ForbiddenActionError({
        message: "Nowe hasło nie może być takie samo jak stare.",
        metaData: {
          ...loggerMetaData,
          passwordResetLinkId: passwordResetLinkId,
          nickname: user.nickname,
        },
        loggerMessage: `Użytkownik ${user.nickname} próbował zresetować hasło, ale podał to samo hasło.`,
      });
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
    const { userNickname } =
      RequestService.extractAuthenticatedUserPayload(req);

    const loggerMetaData = {
      service: services.changeUserPasswordByUser,
      nickname: userNickname,
    };

    const { oldPassword, newPassword } =
      await RequestService.extractRequestFields<ChangePasswordRequest>(
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
      throw new ForbiddenActionError({
        message: "Nowe hasło nie może być takie samo jak stare.",
        metaData: loggerMetaData,
        loggerMessage: `Użytkownik ${userNickname} próbował zmienić hasło, ale podał to samo hasło.`,
      });
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
