import { Request, Response } from "express";
import {
  getAllCategories,
  getAllHobbys,
  getHobbyByCatygory,
  getHobbyByID,
  getCatigoryByID,
} from "../services/hobby.service";

export class HobbyController {
  static async getCategories(req: Request, res: Response): Promise<void> {
    const allCategories = getAllCategories();
    res.json(allCategories);
  }

  static async getHobbys(req: Request, res: Response): Promise<void> {
    const allHobbys = getAllHobbys();
    res.json(allHobbys);
  }

  static async getHobbyByCategory(req: Request, res: Response): Promise<void> {
    const categoryID = req.params.categoryID;
    const answers = await getHobbyByCatygory(Number(categoryID));
    res.json(answers);
  }
  static async getHobbyByID(req: Request, res: Response): Promise<void> {
    const hobbyId = req.params.hobbyId;
    const answers = await getHobbyByID(Number(hobbyId));
    res.json(answers);
  }
  static async getCategoryByID(req: Request, res: Response): Promise<void> {
    const hobbyId = req.params.hobbyId;
    const answers = await getCatigoryByID(Number(hobbyId));
    res.json(answers);
  }
}
