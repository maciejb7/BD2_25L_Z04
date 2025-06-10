import jwt from "jsonwebtoken";
import { config } from "../config";
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedUserPayload {
  userId: string;
  userNickname: string;
  userRole: string;
  isActive: boolean;
  isBanned: boolean;
}

/**
 * Middleware function to authenticate user using JWT access token.
 * @returns middleware function
 */
export const authenticateUser = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).send({ message: "Brak autoryzacji." });
      return;
    }

    const accessToken = authHeader.split(" ")[1];

    try {
      const tokenPayload = jwt.verify(
        accessToken,
        config.ACCESS_TOKEN_SECRET as string,
      ) as AuthenticatedUserPayload;

      if (!tokenPayload.isActive) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });
        res.status(403).send({
          message: "Nie możesz tego zrobić. Twoje konto jest nieaktywne.",
        });
        return;
      }

      if (tokenPayload.isBanned) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });
        res.status(403).send({
          message: "Nie możesz tego zrobić. Twoje konto jest zablokowane.",
        });
        return;
      }

      req.user = tokenPayload;

      next();
    } catch {
      res.status(401).send({ message: "Brak autoryzacji." });
    }
  };
};

/**
 * Middleware function to authenticate user using JWT access token and role.
 * @param role - role to authenticate
 * @returns middleware function
 */
export const authorizeRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).send({ message: "Brak autoryzacji." });
      return;
    }

    if (req.user.userRole !== role) {
      res.status(403).send({ message: "Brak uprawnień." });
      return;
    }

    next();
  };
};

export const AuthMiddleware = {
  authenticateUser,
  authorizeRole,
};
