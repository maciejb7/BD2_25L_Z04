import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../db/models/user";
import { DateTime } from "luxon";
import { RefreshToken } from "../db/models/refresh-token";
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
} from "../errors/auth-errors";
import { UserNotFoundError } from "../errors/user-errors";

/**
 * Class with static methods to use in authentication process
 */
class JWTService {
  /**
   * Generates a JWT access token for given user.
   * @param user
   * @returns jwt access token
   */
  static generateAccessToken(user: User): string {
    return jwt.sign(
      { userId: user.userId, userNickname: user.nickname, userRole: user.role },
      config.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      },
    );
  }

  /**
   * Generaters a JWT refresh token for given user stored in database.
   * @param user
   * @returns jwt refresh token
   */
  static async generateRefreshToken(user: User): Promise<string> {
    const tokenBody = jwt.sign(
      { userId: user.userId, userNickname: user.nickname, userRole: user.role },
      config.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "30d",
      },
    );

    const expiresAt = DateTime.now().plus({ days: 30 }).toJSDate();

    await RefreshToken.create({
      tokenBody: tokenBody,
      expiresAt: expiresAt,
      userId: user.userId,
    });

    return tokenBody;
  }

  /**
   * Generates a new JWT access token for given refresh token.
   * @param refreshTokenBody
   * @returns jwt access token
   * @throws InvalidRefreshTokenError if refresh token is invalid (not found in database)
   * @throws ExpiredRefreshTokenError if refresh token is expired
   * @throws UserNotFoundError if user for refresh token is not found
   */
  static async refreshAccessToken(refreshTokenBody: string): Promise<string> {
    const refreshToken = await RefreshToken.findOne({
      where: { tokenBody: refreshTokenBody },
    });

    if (!refreshToken) {
      throw new InvalidRefreshTokenError();
    }

    if (DateTime.now() > DateTime.fromJSDate(refreshToken.expiresAt)) {
      throw new ExpiredRefreshTokenError();
    }

    const user = await User.findByPk(refreshToken.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return this.generateAccessToken(user);
  }

  /**
   * Deletes given refresh token from database.
   * @param refreshTokenBody refresh token to delete
   * @throws InvalidRefreshTokenError if refresh token is invalid (not found in database)
   */
  static async revokeRefreshToken(refreshTokenBody: string): Promise<void> {
    const destroyCounter = await RefreshToken.destroy({
      where: { tokenBody: refreshTokenBody },
    });

    if (destroyCounter === 0) {
      throw new InvalidRefreshTokenError();
    }
  }

  /**
   * Deletes all refresh tokens for given user from database.
   * @param userId user id to delete refresh tokens
   * @throws UserNotFoundError if user for refresh token is not found
   */
  static async revokeAllRefreshTokens(userId: string): Promise<void> {
    const destroyCounter = await RefreshToken.destroy({
      where: { userId: userId },
    });

    if (destroyCounter === 0) {
      throw new UserNotFoundError();
    }
  }
}
