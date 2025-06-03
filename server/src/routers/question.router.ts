import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/random",
  AuthMiddleware.authenticateUser(),
  QuestionController.getRandom,
);
router.get(
  "/answers",
  AuthMiddleware.authenticateUser(),
  QuestionController.getAllAnswers,
);
router.get(
  "/answers/user/:userId",
  AuthMiddleware.authenticateUser(),
  QuestionController.getAnswersByUser,
);
router.get(
  "/answers/question/:questionId",
  AuthMiddleware.authenticateUser(),
  QuestionController.getAnswersByQuestion,
);
router.post(
  "/answer",
  AuthMiddleware.authenticateUser(),
  QuestionController.postAnswer,
);

export default router;
