import { Op } from "sequelize";
import { User } from "../db/models/user";
import { ValidationService } from "./validation.service";
import bcrypt from "bcrypt";
import { InvalidPasswordError, UserNotFoundError } from "../errors/errors";

class AuthService {
  /**
   * Authenticates a user by checking if the provided nickname or email and password match a user in the database.
   * @param nicknameOrEmail The nickname or email of the user.
   * @param password The password of the user.
   * @returns The authenticated user.
   * @throws UserNotFoundError if the user is not found.
   * @throws InvalidPasswordError if the password is incorrect.
   */
  static async authenticateUser(
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

    // Check if user exists
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
