import { Request, Response } from "express";
import {
  getRandomQuestions,
  saveAnswer,
  getAllAnswers,
  getAnswersByQuestion,
  getAnswersByUser,
} from "../services/question.service";
import { questions } from "../db/models/question";
import { User } from "../db/models/user";

export class QuestionController {
  static async getRandom(req: Request, res: Response): Promise<void> {
    try {
      const count = Number(req.query.count);

      if (isNaN(count) || !Number.isInteger(count)) {
        res
          .status(400)
          .json({ error: "Number of questions must be an integer" });
        return;
      }

      const totalQuestions = questions.length;
      const min = 1;
      const max = totalQuestions;

      if (count < min) {
        res
          .status(400)
          .json({ error: `Minimum number of questions is ${min}` });
        return;
      }

      if (count > max) {
        res
          .status(400)
          .json({ error: `Maximum number of questions is ${max}` });
        return;
      }

      const randomQuestions = getRandomQuestions(count);
      res.json(randomQuestions);
    } catch (error) {
      console.error("Error getting random questions", error);
      res.status(500).json({ error: "Error getting random questions" });
    }
  }

  static async postAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { userId, questionId, answer } = req.body;
      if (!userId || !questionId || !answer) {
        res.status(400).json({ error: "Given Answer is missing data" });
        return;
      }
      const questionExists = questions.find((q) => q.id === questionId);
      if (!questionExists) {
        res
          .status(404)
          .json({ error: `There is no question with id: ${questionId}` });
        return;
      }
      try {
        const user = await User.findByPk(userId);
      } catch (error) {
        console.error(`There is no user with id: ${userId}`, error);
        res.status(500).json({ error: `There is no user with id: ${userId}` });
        return;
      }
      const saved = await saveAnswer(userId, questionId, answer);
      res.json(saved);
    } catch (error) {
      console.error("Error saving answer", error);
      res.status(500).json({ error: "Error saving answer" });
    }
  }

  static async getAnswersByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const answers = await getAnswersByUser(userId);
      if (!answers || answers.length === 0) {
        res
          .status(404)
          .json({ message: `No answer for user with id: ${userId}` });
      }
      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by userId", error);
      res.status(500).json({ error: "Error getting answers by userId" });
    }
  }

  static async getAnswersByQuestion(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const questionId = req.params.questionId;
      const answers = await getAnswersByQuestion(questionId);
      if (!answers || answers.length === 0) {
        res
          .status(404)
          .json({ message: `No answer for question with id: ${questionId}` });
      }
      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by questionId", error);
      res.status(500).json({ error: "Error getting answers by questionId" });
    }
  }

  static async getAllAnswers(req: Request, res: Response): Promise<void> {
    try {
      const answers = await getAllAnswers();
      if (!answers || answers.length === 0) {
        res
          .status(400)
          .json({ message: "There are no answers in the database" });
      }
      res.json(answers);
    } catch (error) {
      console.error("Error getting all answers", error);
      res.status(500).json({ error: "Error getting all answers" });
    }
  }
}
