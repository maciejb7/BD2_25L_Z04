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
      const nickname = req.body.nickname?.trim();
      const name = req.body.name?.trim();
      const surname = req.body.surname?.trim();
      const email = req.body.email?.trim();
      const password = req.body.password?.trim();

      const nicknameValidation = ValidationService.isStringFieldValid(
        nickname,
        "Nick",
        3,
        20,
      );
      if (nicknameValidation !== true) {
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
        res.status(400).json({ message: surnameValidation });
        return;
      }

      const emailValidation = ValidationService.isEmailValid(email);
      if (emailValidation !== true) {
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

  // static async login(req: Request, res: Response): Promise<void> {
  //   try {
  //     const {nicknameOrEmail, password} = req.body;

  //     const user = await User.findOne({
  //       where: {
  //         [Op.or]: [
  //           { nickname: nicknameOrEmail },
  //           { email: nicknameOrEmail },
  //         ],
  //       }
  //     });
  //   }
  // }
}
