import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { TokenService } from "../services/token.service";
import { ValidationService } from "../services/validation.service";
import { Op } from "sequelize";
import {
  FieldValidationError,
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../errors/errors";

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

      // Form fields validation
      ValidationService.isStringFieldValid(nickname, "Nick", 3, 20);
      ValidationService.isStringFieldValid(name, "Imię", 2, 50);
      ValidationService.isStringFieldValid(surname, "Nazwisko", 2, 50);
      ValidationService.isEmailValid(email);
      ValidationService.isPasswordValid(password);

      // Check if user already exists
      const existingUserByNickname = await User.findOne({
        where: { nickname: nickname },
      });

      if (existingUserByNickname) {
        throw new UserAlreadyExistsError(
          "Użytkownik o podanym nicku już istnieje.",
          409,
          `(nickname: ${nickname})`,
        );
      }

      const existingUserByEmail = await User.findOne({
        where: { email: email },
      });

      if (existingUserByEmail) {
        throw new UserAlreadyExistsError(
          "Użytkownik o podanym adresie email już istnieje.",
          409,
          `(email: ${email})`,
        );
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await User.create({
        name: name,
        surname: surname,
        nickname: nickname,
        email: email,
        password: hashedPassword,
      });

      const accessToken = TokenService.generateAccessToken(createdUser);
      const refreshToken = TokenService.generateRefreshToken(createdUser);

      logger.info(
        `Użytkownik ${createdUser.nickname} zarejestrował się pomyślnie.`,
        {
          service: "register",
        },
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
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
        logger.warn(`Nieudana próba rejestracji - ${error.message}`, {
          service: "register",
        });
        res.status(error.statusCode).json({ message: error.message });
        return;
      } else if (error instanceof UserAlreadyExistsError) {
        logger.warn(
          `Nieudana próba rejestracji - ${error.message} ${error.loggerMessage}`,
          {
            service: "register",
          },
        );
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
      const { nicknameOrEmail, password } = req.body;

      const user = await User.findOne({
        where: {
          [Op.or]: [{ nickname: nicknameOrEmail }, { email: nicknameOrEmail }],
        },
      });

      if (!user) {
        throw new UserNotFoundError(
          "Nieprawidłowy login lub hasło.",
          401,
          nicknameOrEmail,
        );
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw new InvalidPasswordError(
          "Nieprawidłowy login lub hasło.",
          401,
          nicknameOrEmail,
        );
      }

      const accessToken = TokenService.generateAccessToken(user);
      const refreshToken = TokenService.generateRefreshToken(user);

      logger.info(`Użytkownik ${user.nickname} zalogował się pomyślnie.`, {
        service: "login",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Zalogowano pomyślnie.",
        accessToken: accessToken,
        user: user.toJSON(),
      });
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        logger.warn(`Nieudana próba logowania - Nie znaleziono użytkownika.`, {
          nickOrEmail: error.loggerMessage,
          service: "login",
        });
        res.status(error.statusCode).json({ message: error.message });
        return;
      } else if (error instanceof InvalidPasswordError) {
        logger.warn(`Nieudana próba logowania - Nieprawidłowe hasło.`, {
          nickOrEmail: error.loggerMessage,
          service: "login",
        });
        res.status(error.statusCode).json({ message: error.message });
        return;
      } else {
        logger.error("Wystąpił błąd podczas logowania", error, {
          service: "login",
        });
        res
          .status(500)
          .send("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      }
    }
  }
}
