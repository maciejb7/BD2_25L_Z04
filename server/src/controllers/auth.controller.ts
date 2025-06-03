import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import {
  ConfirmationRequest,
  confirmationRequestFields,
  extractRequestFields,
  LoginRequest,
  loginRequestFields,
  RegisterRequest,
  registerRequestFields,
} from "../types/requests";
import {
  getUserConfirmationValidator,
  getUserDetailsValidator,
  getUserLoginValidator,
} from "../types/validators";
import { handleRequest } from "../utils/handle-request";
import { getDateTimeFromDate } from "../services/validation.service";
import {
  extractAuthenticatedUserPayload,
  extractRefreshToken,
  getAuthenticatedUser,
} from "../services/auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeAllSessions,
  revokeSession,
} from "../services/token.service";

/**
 * Controller for handling user registration and login.
 */

/**
 * Registers a new user.
 */
export const register = handleRequest(async (req: Request, res: Response) => {
  const nicknameForLogging: string = req.body.nickname ?? "";

  const { nickname, email, name, surname, password, gender, birthDate } =
    await extractRequestFields<RegisterRequest>(
      req.body,
      registerRequestFields,
      getUserDetailsValidator({
        service: "register",
        nickname: nicknameForLogging,
      }),
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    name: name,
    surname: surname,
    nickname: nickname,
    email: email,
    gender: gender,
    password: hashedPassword,
    birthDate: getDateTimeFromDate(birthDate).toJSDate(),
  });

  const accessToken = generateAccessToken(createdUser);
  const refreshToken = await generateRefreshToken(createdUser);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  logger.info(`Zarejestrowano nowego użytkownika ${createdUser.nickname}}.`, {
    service: "register",
    nickname: createdUser.nickname,
    email: createdUser.email,
  });

  res.status(201).json({
    message: "Zarejestrowano pomyślnie.",
    accessToken: accessToken,
    user: createdUser.toJSON(),
  });
});

/**
 * Logs in an existing user.
 */
export const login = handleRequest(async (req: Request, res: Response) => {
  const nicknameForLogging: string = req.body.nickname ?? "";
  const { nicknameOrEmail, password } =
    await extractRequestFields<LoginRequest>(
      req.body,
      loginRequestFields,
      getUserLoginValidator({
        service: "login",
        nickname: nicknameForLogging,
      }),
    );

  const user = await getAuthenticatedUser(nicknameOrEmail, password, {
    service: "login",
    nickname: nicknameForLogging,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  logger.info(`Użytkownik ${user.nickname} zalogował się pomyślnie.`, {
    service: "login",
    nickname: user.nickname,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Zalogowano pomyślnie.",
    accessToken: accessToken,
    user: user.toJSON(),
  });
});

/**
 * Logs out the user by clearing the refresh token cookie.
 */
export const logout = handleRequest(async (req: Request, res: Response) => {
  const { userNickname } = extractAuthenticatedUserPayload(req);
  const refreshToken = extractRefreshToken(req);

  await revokeSession(refreshToken, {
    service: "logout",
    nickname: userNickname,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  logger.info(`Użytkownik ${userNickname} wylogował się pomyślnie.`, {
    service: "logout",
    nickname: userNickname,
  });

  res.status(200).json({ message: "Wylogowano pomyślnie." });
});

export const refresh = handleRequest(async (req: Request, res: Response) => {
  const refreshToken = extractRefreshToken(req);

  try {
    const accessToken = await refreshAccessToken(refreshToken, {
      service: "refresh",
    });

    res.status(200).json({
      message: "Odświeżono token dostępu.",
      accessToken: accessToken,
    });
  } catch (error) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    throw error;
  }
});

/**
 * Deletes the authenticated user's account.
 */
export const deleteAccount = handleRequest(
  async (req: Request, res: Response) => {
    const nicknameForLogging: string = req.user?.userNickname?.trim() ?? "";

    const { userId, userNickname } = extractAuthenticatedUserPayload(req);
    const { nickname, password } =
      await extractRequestFields<ConfirmationRequest>(
        req.body,
        confirmationRequestFields,
        getUserConfirmationValidator({
          service: "delete_account_user",
          nickname: nicknameForLogging,
        }),
      );

    if (nickname !== userNickname) {
      logger.error(
        `Nieudana próba usunięcia konta przez użytkownika ${userNickname} - podano inny nick.`,
        {
          service: "delete_account_user",
          nickname: nickname,
        },
      );
      res.status(400).json({
        message: "Nieprawidłowy login lub hasło.",
      });
      return;
    }

    const userToDelete = await getAuthenticatedUser(nickname, password, {
      service: "delete_account_user",
      nickname: nicknameForLogging,
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    await userToDelete.destroy();
    logger.info(`Użytkownik ${nickname} usunął swoje konto.`, {
      service: "delete_account_user",
      nickname: nickname,
      userId: userId,
    });

    res.status(200).json({ message: "Usuwanie konta zakończone sukcesem." });
  },
);

/**
 * Logs out the user from all devices by revoking all sessions.
 */
export const logoutFromAllDevices = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } = extractAuthenticatedUserPayload(req);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    revokeAllSessions(userId, {
      service: "logout_from_all_devices",
      nickname: userNickname,
    });

    logger.info(
      `Użytkownik ${req.user?.userNickname} wylogował się ze wszystkich urządzeń.`,
      {
        service: "logout_from_all_devices",
        nickname: userNickname,
      },
    );

    res
      .status(200)
      .json({ message: "Pomyślnie wylogowano ze wszystkich urządzeń." });
  },
);
