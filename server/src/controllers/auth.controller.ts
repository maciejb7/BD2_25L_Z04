import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import {
  LoginRequest,
  loginRequestFields,
  RegisterRequest,
  registerRequestFields,
} from "../types/requests";
import {
  getUserDetailsValidator,
  getUserLoginValidator,
} from "../types/validators";
import { handleRequest } from "../utils/handle-request";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { ValidationService } from "../services/validation.service";
import { AccountActivationLink } from "../db/models/account-activation-link";
import { DateTime } from "luxon";
import { config } from "../config";
import { EmailService } from "../services/email.service";
import { RequestService } from "../services/request.service";
import { services } from "../constants/services";
import {
  ActivationLinkNotFoundError,
  UserNotFoundError,
} from "../errors/errors";
import requestIp from "request-ip";

/**
 * Registers a new user.
 */
const register = handleRequest(async (req: Request, res: Response) => {
  const loggerMetaData = {
    service: services.register,
    nickname: req.body.nickname,
  };

  const { nickname, email, name, surname, password, gender, birthDate } =
    await RequestService.extractRequestFields<RegisterRequest>(
      req.body,
      registerRequestFields,
      loggerMetaData,
      getUserDetailsValidator(loggerMetaData),
    );

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await User.create({
    name: name,
    surname: surname,
    nickname: nickname,
    email: email,
    gender: gender,
    password: hashedPassword,
    birthDate: ValidationService.getDateTimeFromDate(birthDate).toJSDate(),
  });

  const activationLink = await AccountActivationLink.create({
    userId: createdUser.userId,
    expiresAt: DateTime.now().plus({ minutes: 15 }),
  });

  const activationLinkUrl = `${config.CLIENT_URL}/activate-account/${activationLink.linkId}`;

  await EmailService.sendActivationEmail(
    createdUser.nickname,
    createdUser.email,
    activationLinkUrl,
  );

  logger.info(
    `Zarejestrowano nowego użytkownika ${createdUser.nickname} i wysłano link do aktywacji konta na jego adres email.`,
    {
      service: services.register,
      nickname: createdUser.nickname,
      email: createdUser.email,
    },
  );

  res.status(201).json({
    message:
      "Zarejestrowano pomyślnie. Link aktywacyjny został wysłany na podany adres e-mail.",
  });
});

/**
 * Activates a user account using the provided activation link ID.
 */
const activateUserAccount = handleRequest(
  async (req: Request, res: Response) => {
    const accountActivationLinkId = await RequestService.extractPathParameter(
      req,
      "accountActivationLinkId",
      {
        service: services.activateUserAccount,
      },
    );

    ValidationService.checkIfUUIDIsValid(
      accountActivationLinkId,
      "Link do aktywacji konta",
    );

    const accountActivationLink = await AccountActivationLink.findByPk(
      accountActivationLinkId,
    );

    if (!accountActivationLink) {
      throw new ActivationLinkNotFoundError({
        makeLog: false,
      });
    }

    const user = await User.findByPk(accountActivationLink.userId);

    if (!user) {
      throw new UserNotFoundError({
        message:
          "Nie znaleziono użytkownika powiązanego z linkiem aktywacyjnym.",
        makeLog: false,
      });
    }

    if (DateTime.fromJSDate(accountActivationLink.expiresAt) < DateTime.now()) {
      await user.destroy();
      throw new ActivationLinkNotFoundError({
        makeLog: false,
      });
    }

    user.isActive = true;
    await user.save();
    await accountActivationLink.destroy();

    logger.info(`Konto użytkownika ${user.nickname} zostało aktywowane.`, {
      service: services.activateUserAccount,
      nickname: user.nickname,
    });

    res.status(200).json({
      message: "Pomyślnie aktywowano konto. Możesz się teraz zalogować.",
    });
  },
);

/**
 * Logs in an existing user.
 */
const login = handleRequest(async (req: Request, res: Response) => {
  const loggerMetaData = {
    service: "login",
    nicknameOrEmail: req.body.nicknameOrEmail,
  };
  const { nicknameOrEmail, password } =
    await RequestService.extractRequestFields<LoginRequest>(
      req.body,
      loginRequestFields,
      loggerMetaData,
      getUserLoginValidator(loggerMetaData),
    );

  let ip = requestIp.getClientIp(req);

  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }

  const deviceInfo = RequestService.extractDeviceInfo(req);

  const user = await AuthService.getAuthenticatedUser(
    nicknameOrEmail,
    password,
    loggerMetaData,
  );

  user.lastIp = ip;
  user.lastDevice = deviceInfo;
  user.lastLogin = new Date();
  await user.save();

  const accessToken = TokenService.generateAccessToken(user);
  const refreshToken = await TokenService.generateRefreshToken(
    user,
    ip,
    deviceInfo,
  );

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
const logout = handleRequest(async (req: Request, res: Response) => {
  const loggerMetaData = {
    service: "logout",
    nickname: req.user?.userNickname,
  };
  const { userNickname } = RequestService.extractAuthenticatedUserPayload(req);
  const refreshToken = RequestService.extractRefreshToken(req, loggerMetaData);

  await TokenService.revokeSession(refreshToken, loggerMetaData);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  logger.info(
    `Użytkownik ${userNickname} wylogował się pomyślnie.`,
    loggerMetaData,
  );

  res.status(200).json({ message: "Wylogowano pomyślnie." });
});

/**
 * Refreshes the access token using the provided refresh token.
 */
const refresh = handleRequest(async (req: Request, res: Response) => {
  const refreshToken = RequestService.extractRefreshToken(req);

  try {
    const accessToken = await TokenService.refreshAccessToken(refreshToken, {
      service: services.refresh,
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
 * Logs out the user from all devices by revoking all sessions.
 */
const logoutFromAllDevices = handleRequest(
  async (req: Request, res: Response) => {
    const { userId, userNickname } =
      RequestService.extractAuthenticatedUserPayload(req);

    const loggerMetaData = {
      service: services.logoutFromAllDevices,
      nickname: userNickname,
    };

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    TokenService.revokeAllSessions(userId, loggerMetaData);

    logger.info(
      `Użytkownik ${userNickname} wylogował się ze wszystkich urządzeń.`,
      loggerMetaData,
    );

    res
      .status(200)
      .json({ message: "Pomyślnie wylogowano ze wszystkich urządzeń." });
  },
);

/**
 * Controller for handling user registration, login, sessions and logout.
 */
export const AuthController = {
  register,
  activateUserAccount,
  login,
  logout,
  refresh,
  logoutFromAllDevices,
};
