import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../db/models/user";
import { DateTime } from "luxon";
import { Session } from "../db/models/session";
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  NoRefreshTokenError,
  UserNotFoundError,
} from "../errors/errors";
import { createHash, randomUUID } from "crypto";
import { emptyMetaData } from "../types/others";
import { loggerMessages } from "../errors/loggerMessages";

/**
 * Service for handling tokens.
 */

/**
 * Generates an access token for the given user.
 * @param user The user for whom to generate the access token.
 * @returns The generated access token as a string.
 */
const generateAccessToken = (user: User): string => {
  return jwt.sign(
    { userId: user.userId, userNickname: user.nickname, userRole: user.role },
    config.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
};

/**
 * Generates a refresh token for the given user and stores it in the database.
 * @param user The user for whom to generate the refresh token.
 * @returns The generated refresh token as a string.
 */
const generateRefreshToken = async (user: User): Promise<string> => {
  const token = randomUUID().toString();
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expiresAt = DateTime.now().plus({ days: 30 }).toJSDate();
  await Session.create({
    refreshToken: hashedToken,
    expiresAt: expiresAt,
    userId: user.userId,
  });
  return token;
};

/**
 * Refreshes the access token using the provided refresh token.
 * @param refreshToken The refresh token to use for generating a new access token.
 * @param metaData Optional metadata for logging and error handling.
 * @returns A promise that resolves to the new access token.
 * @throws InvalidRefreshTokenError if the refresh token is invalid or not found.
 * @throws ExpiredRefreshTokenError if the refresh token has expired.
 * @throws UserNotFoundError if the user associated with the session is not found.
 */
const refreshAccessToken = async (
  refreshToken: string,
  metaData = emptyMetaData,
): Promise<string> => {
  const hashedRefreshToken = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOne({
    where: { refreshToken: hashedRefreshToken },
  });

  if (!session)
    throw new InvalidRefreshTokenError({
      metaData: { ...metaData },
      loggerMessage: `${loggerMessages(metaData.service)}: Nie znaleziono sesji dla podanego refresh tokena.`,
    });

  if (DateTime.now() > DateTime.fromJSDate(session.expiresAt))
    throw new ExpiredRefreshTokenError({
      metaData: { ...metaData },
      loggerMessage: `${loggerMessages(metaData.service)}: Token odświeżający wygasł.`,
    });

  const user = await User.findByPk(session.userId);

  if (!user)
    throw new UserNotFoundError({
      metaData: { ...metaData },
      loggerMessage: `${loggerMessages(metaData.service)}: Nie znaleziono użytkownika dla sesji.`,
    });

  return generateAccessToken(user);
};

/**
 * Revokes a session by removing it from the database using the provided refresh token.
 * @param refreshToken The refresh token of the session to be revoked.
 * @param metaData Optional metadata for logging and error handling.
 * @throws InvalidRefreshTokenError if the session with the provided refresh token is not found.
 */
const revokeSession = async (
  refreshToken: string,
  metaData = emptyMetaData,
) => {
  const hashedRefreshToken = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const destroyCounter = await Session.destroy({
    where: { refreshToken: hashedRefreshToken },
  });

  if (destroyCounter === 0) {
    throw new InvalidRefreshTokenError({
      metaData: { ...metaData },
      loggerMessage: `${loggerMessages(metaData.service)}: Nie znaleziono sesji dla podanego refresh tokena.`,
    });
  }
};

/**
 * Revokes all sessions for a given user.
 * @param userId The ID of the user whose sessions should be revoked.
 * @param metaData Optional metadata for logging and error handling.
 * @throws NoRefreshTokenError if no sessions are found for the user.
 */
const revokeAllSessions = async (userId: string, metaData = emptyMetaData) => {
  const destroyCount = await Session.destroy({
    where: { userId: userId },
  });

  if (destroyCount === 0) {
    throw new NoRefreshTokenError({
      message: "Nie znaleziono żadnych sesji dla użytkownika.",
      metaData: { ...metaData, userId: userId },
      statusCode: 404,
      loggerMessage: `${loggerMessages(metaData.service)}: Nie znaleziono żadnych sesji dla użytkownika.`,
    });
  }
};

export const TokenService = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeSession,
  revokeAllSessions,
};
