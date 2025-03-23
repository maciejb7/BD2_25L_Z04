import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { TokenService } from "../services/token.service";
import { PasswordService } from "../services/password.service";

/**
 * Class with static methods to handle authentication requests.
 */
export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, surname, nickname, email, password, role } = req.body;

      if (!name || !surname || !nickname || !email || !password) {
        logger.warn("Nieudana próba rejestracji - brak wymaganych pól.", {
          service: "register",
        });
        res.status(400).json({ message: "Wypełnij wszystkie wymagane pola." });
        return;
      }

      if (role === "admin") {
        logger.warn(
          `Nieautoryzowana próba rejestracji przez użytkownika o nicku ${nickname} jako administrator.`,
          {
            service: "register",
          },
        );
        res.status(403).json({
          message: "Nie masz uprawnień do rejestracji jako administrator.",
        });
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

      const passwordValidation = PasswordService.isPasswordValid(password);
      if (passwordValidation !== true) {
        logger.warn(
          `Nieudana próba rejestracji przez użytkownika o nicku ${nickname} - hasło nie spełnia wymagań: ${passwordValidation}`,
          {
            service: "register",
          },
        );
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
        message: "Rejestracja przebiegła pomyślnie. Zaloguj się.",
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
}
