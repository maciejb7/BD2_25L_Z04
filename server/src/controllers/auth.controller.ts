import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { TokenService } from "../services/token.service";
import { ValidationService } from "../services/validation.service";
import { Op } from "sequelize";

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

      const nicknameValidation = ValidationService.isStringFieldValid(
        nickname,
        "Nick",
        3,
        20,
      );
      if (nicknameValidation !== true) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - ${nicknameValidation}`,
          {
            service: "register",
          },
        );
        res.status(400).json({ message: nicknameValidation });
        return;
      }

      const nameValidation = ValidationService.isStringFieldValid(
        name,
        "Imię",
        2,
        50,
      );
      if (nameValidation !== true) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - ${nameValidation}`,
          {
            service: "register",
          },
        );
        res.status(400).json({ message: nameValidation });
        return;
      }

      const surnameValidation = ValidationService.isStringFieldValid(
        surname,
        "Nazwisko",
        2,
        50,
      );
      if (surnameValidation !== true) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - ${surnameValidation}`,
          {
            service: "register",
          },
        );
        res.status(400).json({ message: surnameValidation });
        return;
      }

      const emailValidation = ValidationService.isEmailValid(email);
      if (emailValidation !== true) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - ${emailValidation}`,
          {
            service: "register",
          },
        );
        res.status(400).json({ message: emailValidation });
        return;
      }

      const existingUserByNickname = await User.findOne({
        where: { nickname: nickname },
      });
      if (existingUserByNickname) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - użytkownik o podanym nicku już istnieje.`,
          {
            service: "register",
          },
        );
        res.status(409).json({
          message: "Użytkownik o podanym nicku już istnieje.",
        });
        return;
      }

      const existingUserByEmail = await User.findOne({
        where: { email: email },
      });
      if (existingUserByEmail) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkonika o nicku ${nickname} na email ${email} - użytkownik o podanym nicku już istnieje.`,
          {
            service: "register",
          },
        );
        res.status(409).json({
          message: "Użytkownik o podanym adresie email już istnieje.",
        });
        return;
      }

      const passwordValidation = ValidationService.isPasswordValid(password);
      logger.warn(
        `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - ${passwordValidation}`,
        {
          service: "register",
        },
      );
      if (passwordValidation !== true) {
        res.status(400).json({ message: passwordValidation });
        return;
      }

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
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "Rejestracja przebiegła pomyślnie.",
        accessToken: accessToken,
        user: createdUser.toJSON(),
      });
    } catch (error) {
      logger.error("Wystąpił błąd podczas rejestracji", error, {
        service: "register",
      });
      res
        .status(500)
        .send("Wystąpił błąd podczas rejestracji. Spróbuj ponownie.");
      return;
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
        logger.warn(
          `Nieudana próba logowania przez użytkownika ${nicknameOrEmail} - użytkownik nie istnieje.`,
          {
            service: "login",
          },
        );
        res.status(401).json({ message: "Nieprawidłowy login lub hasło." });
        return;
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        logger.warn(
          `Nieudana próba logowania przez użytkownika ${user.nickname} - nieprawidłowe hasło.`,
          {
            service: "login",
          },
        );
        res.status(401).json({ message: "Nieprawidłowy login lub hasło." });
        return;
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
      logger.error("Wystąpił błąd podczas logowania", error, {
        service: "login",
      });
      res
        .status(500)
        .send("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
      return;
    }
  }
}
