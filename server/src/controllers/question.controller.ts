import { Request, Response } from "express";
import { getRandomQuestions, saveAnswer } from "../services/question.service";

export const getRandom = (req: Request, res: Response) => {
  const count = Number(req.query.count) || 3;
  const randomQuestions = getRandomQuestions(count);
  res.json(randomQuestions);
};

export const postAnswer = (req: Request, res: Response) => {
  const { userId, questionId, answer } = req.body;
  if (!userId || !questionId || !answer) {
    return res.status(400).json({ error: "Brakuje danych" });
  }
  const saved = saveAnswer(userId, questionId, answer);
  res.json(saved);
};
