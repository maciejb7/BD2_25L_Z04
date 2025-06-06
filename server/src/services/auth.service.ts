import { Op } from "sequelize";
import { User } from "../db/models/user";
import bcrypt from "bcrypt";
import {
  InvalidPasswordError,
  NoAuthenticationError,
  NoRefreshTokenError,
  UserAlreadyExistsByEmailError,
  UserAlreadyExistsByNicknameError,
  UserNotActiveError,
  UserNotFoundError,
} from "../errors/errors";
import { Request } from "express";
import { AuthenticatedUserPayload } from "../middlewares/auth.middleware";
import { loggerMessages } from "../errors/loggerMessages";

/**
 * Extracts the authenticated user payload from the request object.
 * @param request - The Express request object containing user information.
 * @param metaData - Optional metadata for error handling.
 * @returns An object containing the authenticated user's ID, nickname, and role.
 * @throws NoAuthenticationError if the user is not authenticated.
 */
const extractAuthenticatedUserPayload = (
  request: Request,
  metaData = {},
): AuthenticatedUserPayload => {
  if (!request.user)
    throw new NoAuthenticationError({ metaData: { ...metaData } });
  return {
    userId: request.user.userId,
    userNickname: request.user.userNickname,
    userRole: request.user.userRole,
  };
};

/**
 * Extracts the access token from the request object.
 * @param request - The Express request object containing the access token.
 * @param metaData - Optional metadata for error handling.
 * @returns The access token as a string.
 * @throws NoAuthenticationError if the access token is not found in the request.
 */
const extractRefreshToken = (
  request: Request,
  metaData = { service: "" },
): string => {
  const refreshToken = request.cookies?.refreshToken;

  if (!refreshToken)
    throw new NoRefreshTokenError({
      metaData: { ...metaData },
      loggerMessage: `${loggerMessages(metaData.service)}: Brak tokenu odświeżającego.`,
    });

  return refreshToken;
};

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
  metaData = { service: "" },
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
      loggerMessage: `${loggerMessages(metaData.service)}: Nie znaleziono użytkownika.`,
    });
  }

  if (!user.isActive) {
    throw new UserNotActiveError({
      message: "Twoje konto nie jest aktywne. Aktywuj je, aby się zalogować.",
      statusCode: 403,
      metaData: { ...metaData, nicknameOrEmail },
      loggerMessage: `${loggerMessages(metaData.service)}: Konto użytkownika ${user.nickname} nie jest aktywne.`,
    });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new InvalidPasswordError({
      message: "Nieprawidłowy login lub hasło.",
      statusCode: 401,
      metaData: { ...metaData, nicknameOrEmail },
      loggerMessage: `${loggerMessages(metaData.service)}: Nieprawidłowe hasło.`,
    });
  }

  return user;
};

/**
 * Checks if a nickname is already taken by another user.
 * @param nickname - The nickname to check.
 * @param metaData - Optional metadata for error handling.
 * @throws UserAlreadyExistsByNicknameError if a user with the given nickname already exists.
 */
const isNicknameTaken = async (
  nickname: string,
  metaData = { service: "" },
) => {
  const existingUserByNickname = await User.findOne({
    where: { nickname: nickname },
  });

  if (existingUserByNickname) {
    throw new UserAlreadyExistsByNicknameError({
      metaData: { ...metaData, nickname: nickname },
      loggerMessage: `${loggerMessages(metaData.service)}: Użytkownik o podanym nicku już istnieje.`,
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
      loggerMessage: `${loggerMessages(metaData.service)}: Użytkownik o podanym adresie e-mail już istnieje.`,
    });
  }
};

export const AuthService = {
  extractAuthenticatedUserPayload,
  extractRefreshToken,
  getAuthenticatedUser,
  isNicknameTaken,
  isEmailTaken,
};
