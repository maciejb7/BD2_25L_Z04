import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../db/models/user";
import { DateTime } from "luxon";
import { Session } from "../db/models/session";
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
  NoRefreshTokenError,
  UserNotActiveError,
  UserNotFoundError,
} from "../errors/errors";
import { createHash, randomUUID } from "crypto";
import { services } from "../constants/services";
import { AccountBan } from "../db/models/account-ban";
import { AuthService } from "./auth.service";

/**
 * Generates an access token for the given user.
 * @param user The user for whom to generate the access token.
 * @returns The generated access token as a string.
 */
const generateAccessToken = async (user: User): Promise<string> => {
  const isBanned = await AccountBan.findOne({
    where: { givenTo: user.userId },
  });
  return jwt.sign(
    {
      userId: user.userId,
      userNickname: user.nickname,
      userRole: user.role,
      isActive: user.isActive,
      isBanned: isBanned ? true : false,
    },
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
const generateRefreshToken = async (
  user: User,
  userIpAdress: string | null,
  deviceInfo: string | null,
): Promise<string> => {
  const token = randomUUID().toString();
  const hashedToken = createHash("sha256").update(token).digest("hex");
  const expiresAt = DateTime.now().plus({ days: 30 }).toJSDate();
  await Session.create({
    refreshToken: hashedToken,
    expiresAt: expiresAt,
    ipAddress: userIpAdress,
    deviceInfo: deviceInfo,
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
  metaData = { service: services.refresh },
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
      makeLog: false,
    });

  if (DateTime.now() > DateTime.fromJSDate(session.expiresAt))
    throw new ExpiredRefreshTokenError({
      metaData: { ...metaData },
      makeLog: false,
    });

  const user = await User.findByPk(session.userId);

  if (!user)
    throw new UserNotFoundError({
      metaData: { ...metaData },
      makeLog: false,
    });

  if (!user.isActive) {
    throw new UserNotActiveError({
      message: "Twoje konto jest nieaktywne.",
      metaData: { ...metaData, userId: user.userId },
      statusCode: 403,
      loggerMessage: `Użytkownik ${user.nickname} próbował wykonać akcję, ale jego konto jest nieaktywne.`,
    });
  }

  AuthService.checkIfUserIsBanned(user, {
    service: services.refresh,
    userId: user.userId,
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
  metaData = { service: services.logout },
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
      loggerMessage: `Nie znaleziono sesji do dla tokena.`,
    });
  }
};

/**
 * Revokes all sessions for a given user.
 * @param userId The ID of the user whose sessions should be revoked.
 * @param metaData Optional metadata for logging and error handling.
 * @throws NoRefreshTokenError if no sessions are found for the user.
 */
const revokeAllSessions = async (
  userId: string,
  metaData = { service: services.logoutFromAllDevices },
) => {
  const destroyCount = await Session.destroy({
    where: { userId: userId },
  });

  if (destroyCount === 0) {
    throw new NoRefreshTokenError({
      message: "Nie znaleziono żadnych sesji, z których można się wylogować.",
      metaData: { ...metaData, userId: userId },
      statusCode: 404,
      loggerMessage: `Nie znaleziono żadnych sesji dla użytkownika.`,
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
