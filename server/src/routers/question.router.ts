import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/random",
  AuthMiddleware.authenticateUser(),
  QuestionController.getRandom,
);
router.get("/answers", AuthMiddleware.authenticateUser(), (req, res, next) => {
  QuestionController.getAllAnswers(req, res).catch(next);
});
router.get(
  "/answers/user/:userId",
  AuthMiddleware.authenticateUser(),
  (req, res, next) => {
    QuestionController.getAnswersByUser(req, res).catch(next);
  },
);
router.get(
  "/answers/question/:questionId",
  AuthMiddleware.authenticateUser(),
  (req, res, next) => {
    QuestionController.getAnswersByQuestion(req, res).catch(next);
  },
);
router.post("/answer", AuthMiddleware.authenticateUser(), (req, res, next) => {
  QuestionController.postAnswer(req, res).catch(next);
});

export default router;
