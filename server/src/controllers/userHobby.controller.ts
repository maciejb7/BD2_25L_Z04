import { Request, Response } from "express";
import {
  getAll,
  getHobbyByUser,
  getUserByHobby,
  getUserHobbyInformation,
  addUserHobby,
} from "../services/userHobby.service";

export class UserHobbyController {
  static async getAll(req: Request, res: Response): Promise<void> {
    const allCategories = getAll();
    res.json(allCategories);
  }

  static async getHobbyByUser(req: Request, res: Response): Promise<void> {
    const userID = req.params.userID;
    const answers = await getHobbyByUser(Number(userID));
    res.json(answers);
  }
  static async getUserByHobby(req: Request, res: Response): Promise<void> {
    const hobbyID = req.params.hobbyID;
    const answers = await getUserByHobby(Number(hobbyID));
    res.json(answers);
  }
  static async getUserHobbyInformation(
    req: Request,
    res: Response,
  ): Promise<void> {
    const hobbyId = req.params.userID;
    const answers = await getUserHobbyInformation(Number(hobbyId));
    res.json(answers);
  }
  static async addUserHobby(req: Request, res: Response): Promise<void> {
    const { userID, hobbyID, rating } = req.body;
    if (!userID || !hobbyID || !rating) {
      res.status(400).json({ error: "Brakuje danych" });
    }
    const saved = await addUserHobby(userID, hobbyID, rating);
    res.json(saved);
  }
}
