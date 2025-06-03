import { Request, Response } from "express";
import { questions } from "../db/models/question";
import { User } from "../db/models/user";
import { handleRequest } from "../utils/handle-request";
import { QuestionService } from "../services/question.service";

/**
 * Get random questions
 * @param req Request
 * @param res Response
 */
export const getRandom = handleRequest(async (req: Request, res: Response) => {
  try {
    const count = Number(req.query.count);

    // Check if count is a number and an integer
    if (isNaN(count) || !Number.isInteger(count)) {
      res.status(400).json({ error: "Number of questions must be an integer" });
      return;
    }

    // Check if count is in the range of available questions
    const totalQuestions = questions.length;
    const min = 1;
    const max = totalQuestions;
    if (count < min) {
      res.status(400).json({ error: `Minimum number of questions is ${min}` });
      return;
    }
    if (count > max) {
      res.status(400).json({ error: `Maximum number of questions is ${max}` });
      return;
    }

    const randomQuestions = QuestionService.getRandomQuestions(count);
    res.json(randomQuestions);
  } catch (error) {
    console.error("Error getting random questions", error);
    res.status(500).json({ error: "Error getting random questions" });
  }
});

/**
 * Post answer
 * @param req Request
 * @param res Response
 */
export const postAnswer = handleRequest(async (req: Request, res: Response) => {
  try {
    const { userId, questionId, answer } = req.body;

    // Check if userId, questionId, and answer are provided
    if (!userId || !questionId || !answer) {
      res.status(400).json({ error: "Given Answer is missing data" });
      return;
    }

    // Check if questionId exists in the database
    const questionExists = questions.find((q) => q.id === questionId);
    if (!questionExists) {
      res
        .status(404)
        .json({ error: `There is no question with id: ${questionId}` });
      return;
    }

    // Check if userId exists in the database
    try {
      const user = await User.findByPk(userId);
    } catch (error) {
      console.error(`There is no user with id: ${userId}`, error);
      res.status(500).json({ error: `There is no user with id: ${userId}` });
      return;
    }

    const saved = await QuestionService.saveAnswer(userId, questionId, answer);
    res.json(saved);
  } catch (error) {
    console.error("Error saving answer", error);
    res.status(500).json({ error: "Error saving answer" });
  }
});

/**
 * Get answers by user
 * @param req Request
 * @param res Response
 */
export const getAnswersByUserController = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const answers = await QuestionService.getAnswersByUser(userId);

      // Check if userId has any answers
      if (!answers || answers.length === 0) {
        res
          .status(404)
          .json({ message: `No answer for user with id: ${userId}` });
        return;
      }

      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by userId", error);
      res.status(500).json({ error: "Error getting answers by userId" });
    }
  },
);

/**
 * Get answers by question
 * @param req Request
 * @param res Response
 */
export const getAnswersByQuestionController = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const questionId = req.params.questionId;
      const answers = await QuestionService.getAnswersByQuestion(questionId);

      // Check if questionId has any answers
      if (!answers || answers.length === 0) {
        res
          .status(404)
          .json({ message: `No answer for question with id: ${questionId}` });
        return;
      }

      res.json(answers);
    } catch (error) {
      console.error("Error getting answers by questionId", error);
      res.status(500).json({ error: "Error getting answers by questionId" });
    }
  },
);

/**
 * Get all answers
 * @param req Request
 * @param res Response
 */
export const getAllAnswersController = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const answers = await QuestionService.getAllAnswers();

      // Check if there are any answers in the database
      if (!answers || answers.length === 0) {
        res
          .status(400)
          .json({ message: "There are no answers in the database" });
        return;
      }

      res.json(answers);
    } catch (error) {
      console.error("Error getting all answers", error);
      res.status(500).json({ error: "Error getting all answers" });
    }
  },
);

export const QuestionController = {
  getRandom,
  postAnswer,
  getAnswersByUser: getAnswersByUserController,
  getAnswersByQuestion: getAnswersByQuestionController,
  getAllAnswers: getAllAnswersController,
};
