import { Request, Response } from "express";
import { getRandomQuestions, saveAnswer } from "../services/question.service";

export class QuestionController {
  static async getRandom(req: Request, res: Response): Promise<void> {
    const count = Number(req.query.count) || 3;
    const randomQuestions = getRandomQuestions(count);
    res.json(randomQuestions);
  }

  static async postAnswer(
    req: Request,
    res: Response,
  ): Promise<Response | undefined> {
    const { userId, questionId, answer } = req.body;
    if (!userId || !questionId || !answer) {
      return res.status(400).json({ error: "Brakuje danych" });
    }
    const saved = await saveAnswer(userId, questionId, answer);
    return res.json(saved);
  }
}
