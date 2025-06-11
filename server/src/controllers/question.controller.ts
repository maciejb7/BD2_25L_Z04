import { Request, Response } from "express";
import { User } from "../db/models/user";
import { handleRequest } from "../utils/handle-request";
import { QuestionService } from "../services/question.service";
import { RequestService } from "../services/request.service";

/**
 * Get all questions in random order
 * @param req Request
 * @param res Response
 */
export const getAllQuestions = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const questions = await QuestionService.getAllQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error getting questions", error);
      res.status(500).json({ error: "Error getting questions" });
    }
  },
);

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

    // Check if userId exists in the database
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: `There is no user with id: ${userId}` });
        return;
      }
    } catch (error) {
      console.error(`Error finding user with id: ${userId}`, error);
      res.status(500).json({ error: "Database error while finding user" });
      return;
    }

    const saved = await QuestionService.saveAnswer(userId, questionId, answer);
    res.json(saved);
  } catch (error) {
    console.error("Error saving answer", error);

    // Check if it's a question not found error
    if (error instanceof Error && error.message.includes("does not exist")) {
      res.status(404).json({ error: error.message });
      return;
    }

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

/**
 * Get current user's answers for specific questions
 * @param req Request
 * @param res Response
 */
export const getCurrentUserAnswersForQuestions = handleRequest(
  async (req: Request, res: Response) => {
    try {
      const { userId } = RequestService.extractAuthenticatedUserPayload(req);
      const { questionIds } = req.body;

      if (!Array.isArray(questionIds)) {
        res.status(400).json({ error: "questionIds must be an array" });
        return;
      }

      const answers = await QuestionService.getUserAnswersForQuestions(
        userId,
        questionIds,
      );

      res.json(answers);
    } catch (error) {
      console.error("Error getting user answers for questions", error);
      res
        .status(500)
        .json({ error: "Error getting user answers for questions" });
    }
  },
);

export const QuestionController = {
  getAllQuestions,
  postAnswer,
  getAnswersByUser: getAnswersByUserController,
  getAnswersByQuestion: getAnswersByQuestionController,
  getAllAnswers: getAllAnswersController,
  getCurrentUserAnswersForQuestions,
};
