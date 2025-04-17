import { Request, Response } from "express";
import {
  getRandomQuestions,
  saveAnswer,
  getAllAnswers,
  getAnswersByQuestion,
  getAnswersByUser,
} from "../services/question.service";

export class QuestionController {
  static async getRandom(req: Request, res: Response): Promise<void> {
    const count = Number(req.query.count) || 3;
    const randomQuestions = getRandomQuestions(count);
    res.json(randomQuestions);
  }

  static async postAnswer(req: Request, res: Response): Promise<void> {
    const { userId, questionId, answer } = req.body;
    if (!userId || !questionId || !answer) {
      res.status(400).json({ error: "Brakuje danych" });
    }
    const saved = await saveAnswer(userId, questionId, answer);
    res.json(saved);
  }

  static async getAnswersByUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    const answers = await getAnswersByUser(userId);
    res.json(answers);
  }
  static async getAnswersByQuestion(
    req: Request,
    res: Response,
  ): Promise<void> {
    const questionId = req.params.questionId;
    const answers = await getAnswersByQuestion(questionId);
    res.json(answers);
  }
  static async getAllAnswers(req: Request, res: Response): Promise<void> {
    const answers = await getAllAnswers();
    res.json(answers);
  }
}
