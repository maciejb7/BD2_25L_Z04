import jwt from "jsonwebtoken";
import { config } from "../config";
import { Request, Response, NextFunction } from "express";

/**
 * Class with static methods to authenticate and authorize user using JWT. To use before controller methods.
 */
export class AuthMiddleware {
  /**
   * Middleware function to authenticate user using JWT access token.
   * @returns middleware function
   */
  static authenticateUser() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).send("Brak autoryzacji.");
        return;
      }

      const accessToken = authHeader.split(" ")[1];

      try {
        const tokenPayload = jwt.verify(
          accessToken,
          config.ACCESS_TOKEN_SECRET as string,
        ) as {
          userId: string;
          userNickname: string;
          userRole: string;
        };

        req.user = tokenPayload;

        next();
      } catch {
        res.status(401).send("Brak autoryzacji.");
      }
    };
  }

  /**
   * Middleware function to authenticate user using JWT access token and role.
   * @param role - role to authenticate
   * @returns middleware function
   */
  static authorizeRole(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).send("Brak autoryzacji.");
        return;
      }

      if (req.user.userRole !== role) {
        res.status(403).send("Brak uprawnień.");
        return;
      }

      next();
    };
  }
}
