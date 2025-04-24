import { Request, Response } from "express";
import { Gender, User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { TokenService } from "../services/token.service";
import { ValidationService } from "../services/validation.service";
import {
  FieldValidationError,
  InvalidPasswordError,
  NoRefreshTokenError,
  InvalidRefreshTokenError,
  UserAlreadyExistsError,
  UserNotFoundError,
  ExpiredRefreshTokenError,
  NoPermissionsError,
} from "../errors/errors";
import AuthService from "../services/auth.service";
import { Session } from "../db/models/session";

/**
 * Controller for handling user authentication.
 */
export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const nickname = req.body.nickname?.trim() ?? "";
      const name = req.body.name?.trim() ?? "";
      const surname = req.body.surname?.trim() ?? "";
      const email = req.body.email?.trim() ?? "";
      const password = req.body.password?.trim() ?? "";
      const gender = req.body.gender?.trim() ?? "";
      const birthDate = req.body.birthDate?.trim() ?? "";

      // Form fields validation
      ValidationService.isStringFieldValid(nickname, '"Nick"', 3, 20);
      ValidationService.isStringFieldValid(name, '"Imię"', 2, 50);
      ValidationService.isStringFieldValid(surname, '"Nazwisko"', 2, 50);
      ValidationService.isEmailValid(email);
      ValidationService.doesStringFieldMatchesEnum(gender, Gender, '"Płeć"');
      ValidationService.isPasswordValid(password);
      const parsedBirthDay = ValidationService.isDateValid(birthDate);
      ValidationService.isBirthDateValid(parsedBirthDay, 13, 105);

      // Check if user already exists
      const existingUserByNickname = await User.findOne({
        where: { nickname: nickname },
      });

      if (existingUserByNickname) {
        throw new UserAlreadyExistsError(
          "Użytkownik o podanym nicku już istnieje.",
          409,
          {
            nickname: nickname,
          },
        );
      }

      const existingUserByEmail = await User.findOne({
        where: { email: email },
      });

      if (existingUserByEmail) {
        throw new UserAlreadyExistsError(
          "Użytkownik o podanym adresie email już istnieje.",
          409,
          {
            email: email,
          },
        );
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await User.create({
        name: name,
        surname: surname,
        nickname: nickname,
        email: email,
        gender: gender,
        password: hashedPassword,
        birthDate: parsedBirthDay.toJSDate(),
      });

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(createdUser);
      const refreshToken = await TokenService.generateRefreshToken(createdUser);

      logger.info(
        `Użytkownik ${createdUser.nickname} zarejestrował się pomyślnie.`,
        {
          service: "register",
        },
      );

      // Put refresh token in http-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "Zarejestrowano pomyślnie.",
        accessToken: accessToken,
        user: createdUser.toJSON(),
      });
    } catch (error) {
      // Handle errors
      if (error instanceof FieldValidationError) {
        logger.error(`Nieudana próba rejestracji - ${error.message}`, {
          service: "register",
        });
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof UserAlreadyExistsError) {
        logger.error(`Nieudana próba rejestracji - ${error.message}`, {
          ...error.metaData,
          service: "register",
        });
        res.status(error.statusCode).json({ message: error.message });
      } else {
        logger.error("Wystąpił błąd podczas rejestracji", error, {
          service: "register",
        });
        res
          .status(500)
          .send("Wystąpił błąd podczas rejestracji. Spróbuj ponownie.");
      }
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const nicknameOrEmail = req.body.nicknameOrEmail?.trim() ?? "";
      const password = req.body.password?.trim() ?? "";

      const user = await AuthService.loginUser(nicknameOrEmail, password);

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = await TokenService.generateRefreshToken(user);

      logger.info(`Użytkownik ${user.nickname} zalogował się pomyślnie.`, {
        service: "login",
      });

      // Put refresh token in http-only cookie
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
    } catch (error) {
      // Handle errors
      if (error instanceof FieldValidationError) {
        logger.error(`Nieudana próba logowania - ${error.message}`, {
          service: "login",
        });
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof UserNotFoundError) {
        logger.error(`Nieudana próba logowania - Nie znaleziono użytkownika.`, {
          ...error.metaData,
          service: "login",
        });
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof InvalidPasswordError) {
        logger.error(`Nieudana próba logowania - Nieprawidłowe hasło.`, {
          ...error.metaData,
          service: "login",
        });
        res.status(error.statusCode).json({ message: error.message });
      } else {
        logger.error("Wystąpił błąd podczas logowania ", error, {
          service: "login",
        });
        res
          .status(500)
          .send("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      }
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    const { userNickname } = req.user as { userNickname: string };

    try {
      const refreshToken = req.cookies.refreshToken;

      // Check if refresh token exists
      if (!refreshToken) {
        throw new NoRefreshTokenError("Nie jesteś zalogowany.", 401);
      }

      // Revoke session
      await TokenService.revokeSession(refreshToken);

      // Clear refresh token cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });
      logger.info(`Użytkownik ${userNickname} wylogował się pomyślnie.`, {
        service: "logout",
      });
      res.status(200).json({ message: "Wylogowano pomyślnie." });
    } catch (error) {
      // Handle errors
      if (error instanceof NoRefreshTokenError) {
        logger.error(
          `Nieudana próba wylogowania użytkownika ${userNickname} - brak refresh tokena.`,
          {
            service: "logout",
          },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof InvalidRefreshTokenError) {
        logger.error(
          `Nieudana próba wylogowania użytkownika ${userNickname} - nieprawidłowy refresh token.`,
          {
            service: "logout",
          },
        );
        res
          .status(error.statusCode)
          .json({ message: "Nie jesteś zalogowany." });
      } else {
        logger.error(
          `Wystąpił błąd podczas wylogowywania użytkownika ${userNickname}.`,
          error,
          {
            service: "logout",
          },
        );
        res
          .status(500)
          .send("Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.");
      }
    }
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      // Check if refresh token exists
      if (!refreshToken) {
        throw new NoRefreshTokenError("Nie jesteś zalogowany.", 401);
      }

      const accessToken = await TokenService.refreshAccessToken(refreshToken);
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
      if (error instanceof InvalidRefreshTokenError) {
        logger.error("Nieprawidłowy refresh token.", {
          service: "refresh",
        });
        res
          .status(error.statusCode)
          .json({ message: "Twoja sesja wygasła. Zaloguj się ponownie." });
      } else if (error instanceof ExpiredRefreshTokenError) {
        logger.error("Wygasły refresh token.", {
          service: "refresh",
        });
        res
          .status(error.statusCode)
          .json({ message: "Twoja sesja wygasła. Zaloguj się ponownie." });
      } else {
        logger.error(
          "Wystąpił błąd podczas odświeżania tokena dostępu.",
          error,
          {
            service: "refresh",
          },
        );
        res
          .status(500)
          .send(
            "Wystąpił błąd podczas odświeżania tokena dostępu. Spróbuj ponownie.",
          );
      }
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const userNickname = req.user?.userNickname;
      const nicknameOrEmail = req.body.nicknameOrEmail.trim() ?? "";
      const password = req.body.password.trim() ?? "";

      const userToDelete = await AuthService.loginUser(
        nicknameOrEmail,
        password,
      );

      if (
        userId !== userToDelete.userId ||
        userNickname !== userToDelete.nickname
      )
        throw new NoPermissionsError(
          "Nie masz uprawnień do usunięcia konta innego użytkownika.",
          403,
          {
            userId: userId,
            userNickname: userNickname,
            userToDeleteId: userToDelete.id,
            userToDeleteNickname: userToDelete.nickname,
          },
        );

      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      await userToDelete.destroy();
      logger.info(
        `Użytkownik ${userNickname} (${userId}) usunął swoje konto.`,
        { service: "delete-account-user" },
      );
      res.status(200).json({ message: "Usuwanie konta zakończone sukcesem." });
    } catch (error) {
      if (error instanceof FieldValidationError) {
        logger.error(
          `Nieudana próba usunięcia konta przez użytkownika - ${error.message}`,
          { service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof UserNotFoundError) {
        logger.error(
          `Nieudana próba usunięcia konta przez użytkownika - ${error.message}`,
          { ...error.metaData, service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof InvalidPasswordError) {
        logger.error(
          `Nieudana próba usunięcia konta przez użytkownika - ${error.message}`,
          { ...error.metaData, service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof NoPermissionsError) {
        logger.error(
          `Nieautoryzowana próba usunięcia konta przez użytkownika - ${error.message}`,
          { ...error.metaData, service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else {
        logger.error("Wystąpił nieznany błąd podczas usuwania konta", error, {
          service: "delete-account-user",
        });
        res.status(500).json({
          message: "Wystąpił błąd podczas usuwania konta. Spróbuj ponownie.",
        });
      }
    }
  }

  static async logoutFromAllDevices(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      const deletedSessionsAmount = await Session.destroy({
        where: { userId: userId },
      });

      if (deletedSessionsAmount === 0) {
        throw new NoRefreshTokenError("Brak dostępnych sesji.", 401);
      }

      logger.info(
        `Użytkownik ${req.user?.userNickname} (${userId}) wylogował się ze wszystkich urządzeń.`,
      );

      res
        .status(200)
        .json({ message: "Pomyślnie wylogowano ze wszystkich urządzeń." });
    } catch (error) {
      if (error instanceof NoRefreshTokenError) {
        res.status(error.statusCode).json({ message: error.message });
      }
      logger.error(
        "Wystąpił nieznany błąd podczas wylogowywania ze wszystkich urządzeń",
        error,
        { service: "logout-from-all-devices" },
      );
      res.status(500).json({
        message:
          "Wystąpił błąd poczas wylogowywania ze wszystkich urządzeń. Spróbuj ponownie.",
      });
    }
  }
}
