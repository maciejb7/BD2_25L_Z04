import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      userNickname: string;
      userRole: string;
      isActive: boolean;
      isBanned: boolean;
    };
  }
}
