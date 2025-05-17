import { Request, Response } from "express";
import { User } from "../db/models/user";
import path from "path";
import fs from "fs";

export class UserController {
  /**
   * Returns basic informations about the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async getUserInfo(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "Nie znaleziono użytkownika." });
      return;
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  }

  /**
   * Returns the avatar of the currently authenticated user.
   * Use only with "authenticateUser" middleware.
   */
  static async getUserAvatar(req: Request, res: Response): Promise<void> {
    const avatarsPath = path.join(__dirname, "..", "..", "uploads", "avatars");
    const userId = req.user?.userId;

    let avatarFilePath = path.join(avatarsPath, `${userId}.jpg`);

    if (!fs.existsSync(avatarFilePath))
      avatarFilePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "defaultAvatar.jpg",
      );

    res.sendFile(avatarFilePath);
  }
}
