import { Request, Response } from "express";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import logger from "../logger";
import { JWTService } from "../services/jwt-service";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, surname, nickname, email, password, role } = req.body;

      if (role === "admin") {
        res.status(403).json({
          message: "Nie masz uprawnień do rejestracji jako administrator.",
        });
        return;
      }

      if (!name || !surname || !nickname || !email || !password) {
        res.status(400).json({ message: "Wypełnij wszystkie wymagane pola." });
        return;
      }

      const existingUserByNickname = await User.findOne({
        where: { nickname: nickname },
      });
      if (existingUserByNickname) {
        res.status(409).json({
          message: "Użytkownik o podanym nicku już istnieje.",
        });
        return;
      }

      const existingUserByEmail = await User.findOne({
        where: { email: email },
      });
      if (existingUserByEmail) {
        res.status(409).json({
          message: "Użytkownik o podanym adresie email już istnieje.",
        });
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

      const accessToken = JWTService.generateAccessToken(createdUser);
      const refreshToken = JWTService.generateRefreshToken(createdUser);

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
