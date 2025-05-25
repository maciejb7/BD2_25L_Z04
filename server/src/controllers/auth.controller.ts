import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { TokenService } from "../services/token.service";
import { ValidationService } from "../services/validation.service";
import {
  FieldValidationError,
  InvalidPasswordError,
  InvalidRefreshTokenError,
  UserNotFoundError,
  ExpiredRefreshTokenError,
} from "../errors/errors";
import AuthService from "../services/auth.service";
import { userValidator } from "../utils/validators";

/**
 * Controller for handling user authentication.
 */
export class AuthController {
  /**
   * Registers a new user and logs them in.
   */
  static async register(req: Request, res: Response): Promise<void> {
    const nickname: string = req.body.nickname?.trim() ?? "";
    const email: string = req.body.email?.trim() ?? "";
    const name: string = req.body.name?.trim() ?? "";
    const surname: string = req.body.surname?.trim() ?? "";
    const password: string = req.body.password?.trim() ?? "";
    const gender: string = req.body.gender?.trim() ?? "";
    const birthDate: string = req.body.birthDate?.trim() ?? "";

    try {
      // Validate user data
      await userValidator.nickname(nickname);
      await userValidator.email(email);
      userValidator.name(name);
      userValidator.surname(surname);
      userValidator.password(password);
      userValidator.birthDate(birthDate);

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await User.create({
        name: name,
        surname: surname,
        nickname: nickname,
        email: email,
        gender: gender,
        password: hashedPassword,
        birthDate: ValidationService.formatToDateTime(birthDate).toJSDate(),
      });

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(createdUser);
      const refreshToken = await TokenService.generateRefreshToken(createdUser);

      // Put refresh token in http-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      logger.info(
        `Zarejestrowano nowego użytkownika ${createdUser.nickname}}.`,
        {
          service: "register",
          nickname: createdUser.nickname,
          email: createdUser.email,
        },
      );

      res.status(201).json({
        message: "Zarejestrowano pomyślnie.",
        accessToken: accessToken,
        user: createdUser.toJSON(),
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        logger.error(`Nieudana próba rejestracji - ${error.message}.`, {
          ...error.metaData,
          service: "register",
        });
        res.status(409).json({
          message: "Użytkownik o podanym adresie email już istnieje.",
        });
      } else if (error instanceof FieldValidationError) {
        logger.error(`Błąd walidacji podczas rejestracji - ${error.message}`, {
          service: "register",
          nickname: nickname,
          email: email,
        });
        res.status(error.statusCode).json({ message: error.message });
      } else {
        logger.error("Wystąpił nieznany błąd podczas rejestracji:", error, {
          service: "register",
        });
        res
          .status(500)
          .send(
            "Wystąpił błąd podczas rejestracji. Spróbuj ponownie lub skontaktuj się z administratorem.",
          );
      }
    }
  }

  /**
   * Logs in a user.
   */
  static async login(req: Request, res: Response): Promise<void> {
    const nicknameOrEmail: string = req.body.nicknameOrEmail?.trim() ?? "";
    const password: string = req.body.password?.trim() ?? "";

    try {
      const user = await AuthService.authenticateUser(
        nicknameOrEmail,
        password,
      );

      // Generate tokens
      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = await TokenService.generateRefreshToken(user);

      logger.info(`Użytkownik ${user.nickname} zalogował się pomyślnie.`, {
        service: "login",
        nickname: user.nickname,
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
      if (error instanceof FieldValidationError) {
        logger.error(`Błąd walidacji podczas logowania - ${error.message}`, {
          service: "login",
          nicknameOrEmail: nicknameOrEmail,
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
        logger.error("Wystąpił nieznany błąd podczas logowania ", error, {
          service: "login",
        });
        res
          .status(500)
          .send(
            "Wystąpił błąd podczas logowania. Spróbuj ponownie lub skontaktuj się z administratorem.",
          );
      }
    }
  }

  /**
   * Logs out a user.
   * Use only with authenticateUser middleware.
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const userNickname: string = req.user?.userNickname ?? "";
    const refreshToken: string = req.cookies.refreshToken ?? "";

    // Check if refresh token exists
    if (!refreshToken) {
      logger.error(
        `Nieudana próba wylogowania użytkownika ${userNickname} - brak refresh tokena.`,
        {
          service: "logout",
          nickname: userNickname,
        },
      );
      res.status(401).json({ message: "Nie jesteś zalogowany." });
      return;
    }

    try {
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
      if (error instanceof InvalidRefreshTokenError) {
        logger.error(
          `Nieudana próba wylogowania użytkownika ${userNickname} - nieprawidłowy refresh token.`,
          {
            service: "logout",
            nickname: userNickname,
          },
        );
        res
          .status(error.statusCode)
          .json({ message: "Nie jesteś zalogowany." });
      } else {
        logger.error(
          `Wystąpił nieznany błąd podczas wylogowywania użytkownika ${userNickname}.`,
          error,
          {
            service: "logout",
          },
        );
        res
          .status(500)
          .send(
            "Wystąpił błąd podczas wylogowywania. Spróbuj ponownie lub skontaktuj się z administratorem.",
          );
      }
    }
  }

  /**
   * Refreshes the access token using the refresh token.
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken: string = req.cookies.refreshToken ?? "";

    // Check if refresh token exists
    if (!refreshToken) {
      res.status(401).json({ message: "Nie jesteś zalogowany." });
      return;
    }

    try {
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
        res
          .status(error.statusCode)
          .json({ message: "Twoja sesja wygasła. Zaloguj się ponownie." });
      } else if (error instanceof ExpiredRefreshTokenError) {
        res
          .status(error.statusCode)
          .json({ message: "Twoja sesja wygasła. Zaloguj się ponownie." });
      } else {
        logger.error(
          "Wystąpił nieznany błąd podczas odświeżania tokena dostępu.",
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

  /**
   * Deletes the user's account by user himself.
   * Use only with authenticateUser middleware.
   */
  static async deleteAccount(req: Request, res: Response) {
    const userId: string = req.user?.userId ?? "";
    const nickname: string = req.user?.userNickname ?? "";
    const nicknameFromForm: string = req.body.nickname?.trim() ?? "";
    const passwordFromForm: string = req.body.password?.trim() ?? "";

    if (nickname !== nicknameFromForm) {
      logger.error(
        `Nieudana próba usunięcia konta przez użytkownika ${nickname} - podano inny nick.`,
        {
          service: "delete-account-user",
          nickname: nickname,
        },
      );
      res.status(400).json({
        message: "Nieprawidłowy login lub hasło.",
      });
      return;
    }

    try {
      const userToDelete = await AuthService.authenticateUser(
        nicknameFromForm,
        passwordFromForm,
      );

      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      await userToDelete.destroy();
      logger.info(`Użytkownik ${nickname} usunął swoje konto.`, {
        service: "delete-account-user",
        nickname: nickname,
        userId: userId,
      });
      res.status(200).json({ message: "Usuwanie konta zakończone sukcesem." });
    } catch (error) {
      if (error instanceof FieldValidationError) {
        logger.error(
          `Błąd walidacji podczasu usuwania konta - ${error.message}`,
          { service: "delete-account-user", nickname: nickname },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof UserNotFoundError) {
        logger.error(
          `Nieudana próba usunięcia konta przez użytkownika - Nie znaleziono użytkownika.`,
          { ...error.metaData, service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else if (error instanceof InvalidPasswordError) {
        logger.error(
          `Nieudana próba usunięcia konta przez użytkownika - Nieprawidłowe hasło.`,
          { ...error.metaData, service: "delete-account-user" },
        );
        res.status(error.statusCode).json({ message: error.message });
      } else {
        logger.error("Wystąpił nieznany błąd podczas usuwania konta", error, {
          service: "delete-account-user",
        });
        res.status(500).json({
          message:
            "Wystąpił błąd podczas usuwania konta. Spróbuj ponownie lub skontaktuj się z administratorem.",
        });
      }
    }
  }

  /**
   * Logs out the user from all devices.
   * Use only with authenticateUser middleware.
   */
  static async logoutFromAllDevices(req: Request, res: Response) {
    const userId: string = req.user?.userId ?? "";
    const nickname: string = req.user?.userNickname ?? "";

    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
      });

      TokenService.revokeAllSessions(userId);

      logger.info(
        `Użytkownik ${req.user?.userNickname} wylogował się ze wszystkich urządzeń.`,
        {
          service: "logout-from-all-devices",
          nickname: nickname,
        },
      );

      res
        .status(200)
        .json({ message: "Pomyślnie wylogowano ze wszystkich urządzeń." });
    } catch (error) {
      if (error instanceof InvalidRefreshTokenError) {
        logger.error(
          `Nieudana próba wylogowania użytkownika ${nickname} ze wszystkich urządzeń - brak refresh tokenów.`,
          {
            service: "logout-from-all-devices",
            nickname: nickname,
          },
        );
        res
          .status(error.statusCode)
          .json({ message: "Nie jesteś zalogowany." });
      } else {
        logger.error(
          "Wystąpił nieznany błąd podczas wylogowywania ze wszystkich urządzeń",
          error,
          { service: "logout-from-all-devices", nickname: nickname },
        );
        res.status(500).json({
          message:
            "Wystąpił błąd poczas wylogowywania ze wszystkich urządzeń. Spróbuj ponownie lub skontaktuj się z administratorem.",
        });
      }
    }
  }
}
