import { Op } from "sequelize";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import {
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../errors/errors";
import { loginValidator } from "../utils/validators";

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
    loginValidator.nicknameOrEmail(nicknameOrEmail);
    loginValidator.password(password);

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

  static async isNicknameTaken(nickname: string): Promise<void> {
    const existingUserByNickname = await User.findOne({
      where: { nickname: nickname },
    });

    if (existingUserByNickname) {
      throw new UserAlreadyExistsError(
        "Użytkownik o podanym nicku już istnieje.",
        409,
        { nickname: nickname },
      );
    }
  }

  static async isEmailTaken(email: string): Promise<void> {
    const existingUserByEmail = await User.findOne({
      where: { email: email },
    });

    if (existingUserByEmail) {
      throw new UserAlreadyExistsError(
        "Użytkownik o podanym adresie email już istnieje.",
        409,
        { email: email },
      );
    }
  }
}

export default AuthService;
