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
    try {
      const count = Number(req.query.count) || 3;
      const randomQuestions = getRandomQuestions(count);
      res.json(randomQuestions);
    } catch (error) {
      console.error("Error getting random questions", error);
      res.status(500).json({ error: "Wystąpił błąd" });
    }
  }

  static async postAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { userId, questionId, answer } = req.body;
      if (!userId || !questionId || !answer) {
        res.status(400).json({ error: "Brakuje danych" });
      }
      const saved = await saveAnswer(userId, questionId, answer);
      res.json(saved);
    } catch (error) {
      console.error("Error saving answer", error);
      res.status(500).json({ error: "Wystąpił błąd" });
    }
  }

  static async getAnswersByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const answers = await getAnswersByUser(userId);
      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by userId", error);
      res.status(500).json({ error: "Wystąpił błąd" });
    }
  }

  static async getAnswersByQuestion(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const questionId = req.params.questionId;
      const answers = await getAnswersByQuestion(questionId);
      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by questionId", error);
      res.status(500).json({ error: "Wystąpił błąd" });
    }
  }

  static async getAllAnswers(req: Request, res: Response): Promise<void> {
    try {
      const answers = await getAllAnswers();
      res.json(answers);
    } catch (error) {
      console.error("Error getting all answers", error);
      res.status(500).json({ error: "Wystąpił błąd" });
    }
  }
}
