import { Op } from "sequelize";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import {
  InvalidPasswordError,
  UserAlreadyExistsByEmailError,
  UserAlreadyExistsByNicknameError,
  UserNotActiveError,
  UserNotFoundError,
} from "../errors/errors";
import { services } from "../constants/services";
import { AccountBan } from "../db/models/account-ban";
import { DateTime } from "luxon";

/**
 * Retrieves an authenticated user based on their nickname or email and password.
 * @param nicknameOrEmail - The user's nickname or email address.
 * @param password - The user's password.
 * @param metaData - Optional metadata for error handling.
 * @returns A promise that resolves to the authenticated user.
 * @throws UserNotFoundError if no user is found with the provided nickname or email.
 * @throws InvalidPasswordError if the provided password does not match the user's password.
 */
const getAuthenticatedUser = async (
  nicknameOrEmail: string,
  password: string,
  metaData = { service: services.getAuthenticatedUser },
): Promise<User> => {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ nickname: nicknameOrEmail }, { email: nicknameOrEmail }],
    },
  });

  if (!user) {
    throw new UserNotFoundError({
      message: "Nieprawidłowy login lub hasło.",
      statusCode: 401,
      metaData: { ...metaData, nicknameOrEmail },
    });
  }

  if (!user.isActive) {
    throw new UserNotActiveError({
      statusCode: 403,
      metaData: { ...metaData, nicknameOrEmail },
      loggerMessage: `Użytkownik ${user.nickname} próbuje wykonać akcję, ale jego konto nie jest aktywne.`,
    });
  }

  await checkIfUserIsBanned(user, metaData);

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new InvalidPasswordError({
      message: "Nieprawidłowy login lub hasło.",
      statusCode: 401,
      metaData: { ...metaData, nicknameOrEmail },
    });
  }

  return user;
};

/**
 * Checks if a user is banned.
 * @param user - The user to check.
 * @param metaData - Optional metadata for error handling.
 * @throws UserNotActiveError if the user is banned.
 */
const checkIfUserIsBanned = async (
  user: User,
  metaData: Record<string, unknown> = {
    service: services.getAuthenticatedUser,
  },
) => {
  const isBanned = await AccountBan.findOne({
    where: { givenTo: user.userId },
  });

  if (isBanned) {
    const admin = await User.findOne({
      where: { userId: isBanned.givenBy },
    });

    throw new UserNotActiveError({
      message: `Twoje konto zostało zablokowane przez ${admin?.nickname}.\nPowód: ${isBanned.reason}\nNadano: ${DateTime.fromJSDate(isBanned.givenAt).toISODate()}`,
      statusCode: 403,
      metaData: {
        ...metaData,
        userId: user.userId,
      },
      loggerMessage: `Użytkownik ${user.nickname} próbuje wykonać akcję, ale jest zbanowany.`,
    });
  }
};

/**
 * Checks if a nickname is already taken by another user.
 * @param nickname - The nickname to check.
 * @param metaData - Optional metadata for error handling.
 * @throws UserAlreadyExistsByNicknameError if a user with the given nickname already exists.
 */
const isNicknameTaken = async (
  nickname: string,
  metaData = { service: services.isNicknameTaken },
) => {
  const existingUserByNickname = await User.findOne({
    where: { nickname: nickname },
  });

  if (existingUserByNickname) {
    throw new UserAlreadyExistsByNicknameError({
      metaData: { ...metaData, nickname: nickname },
    });
  }
};

/**
 * Checks if an email is already taken by another user.
 * @param email - The email to check.
 * @param metaData  - Optional metadata for error handling.
 */
const isEmailTaken = async (email: string, metaData = { service: "" }) => {
  const existingUserByEmail = await User.findOne({
    where: { email: email },
  });

  if (existingUserByEmail) {
    throw new UserAlreadyExistsByEmailError({
      metaData: { ...metaData, email: email },
    });
  }
};

export const AuthService = {
  getAuthenticatedUser,
  checkIfUserIsBanned,
  isNicknameTaken,
  isEmailTaken,
};
