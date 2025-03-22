import jwt from "jsonwebtoken";
import { config } from "../config";
import { User } from "../db/models/user";
import { DateTime } from "luxon";
import { Session } from "../db/models/session";
import {
  ExpiredRefreshTokenError,
  InvalidRefreshTokenError,
} from "../errors/auth-errors";
import { UserNotFoundError } from "../errors/user-errors";
import { createHash, randomUUID } from "crypto";

/**
 * Class with static methods to use in authentication process
 */
export class JWTService {
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
   * Generaters a refresh token for given user stored in database.
   * @param user
   * @returns jwt refresh token
   */
  static async generateRefreshToken(user: User): Promise<string> {
    const token = randomUUID().toString();

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const expiresAt = DateTime.now().plus({ days: 30 }).toJSDate();

    await Session.create({
      token: hashedToken,
      expiresAt: expiresAt,
      userId: user.userId,
    });

    return token;
  }

  /**
   * Generates a new JWT access token for given refresh token.
   * @param refreshTokenBody
   * @returns jwt access token
   * @throws InvalidRefreshTokenError if refresh token is invalid (not found in database)
   * @throws ExpiredRefreshTokenError if refresh token is expired
   * @throws UserNotFoundError if user for refresh token is not found
   */
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const hashedRefreshToken = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      where: { token: hashedRefreshToken },
    });

    if (!session) {
      throw new InvalidRefreshTokenError();
    }

    if (DateTime.now() > DateTime.fromJSDate(session.expiresAt)) {
      throw new ExpiredRefreshTokenError();
    }

    const user = await User.findByPk(session.userId);

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
  static async revokeRefreshToken(refreshToken: string): Promise<void> {
    const destroyCounter = await Session.destroy({
      where: { token: refreshToken },
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
    const destroyCounter = await Session.destroy({
      where: { userId: userId },
    });

    if (destroyCounter === 0) {
      throw new UserNotFoundError();
    }
  }
}
