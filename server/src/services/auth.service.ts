import { Op } from "sequelize";
import { User } from "../db/models/user";
import { ValidationService } from "./validation.service";
import bcrypt from "bcrypt";
import { InvalidPasswordError, UserNotFoundError } from "../errors/errors";

class AuthService {
  static async loginUser(
    nicknameOrEmail: string,
    password: string,
  ): Promise<User> {
    ValidationService.isStringFieldValid(nicknameOrEmail, "Login");
    ValidationService.isStringFieldValid(password, "Hasło");

    const user = await User.findOne({
      where: {
        [Op.or]: [{ nickname: nicknameOrEmail }, { email: nicknameOrEmail }],
      },
    });

    if (!user) {
      throw new UserNotFoundError("Nieprawidłowy login lub hasło.", 401, {
        nicknameOrEmail: nicknameOrEmail,
      });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new InvalidPasswordError("Nieprawidłowy login lub hasło.", 401, {
        nicknameOrEmail: nicknameOrEmail,
      });
    }

    return user;
  }
}

export default AuthService;
