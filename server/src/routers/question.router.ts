import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const router = Router();

router.get("/random", authenticateUser(), QuestionController.getRandom);
router.get("/answers", authenticateUser(), (req, res, next) => {
  QuestionController.getAllAnswers(req, res).catch(next);
});
router.get("/answers/user/:userId", authenticateUser(), (req, res, next) => {
  QuestionController.getAnswersByUser(req, res).catch(next);
});
router.get(
  "/answers/question/:questionId",
  authenticateUser(),
  (req, res, next) => {
    QuestionController.getAnswersByQuestion(req, res).catch(next);
  },
);
router.post("/answer", authenticateUser(), (req, res, next) => {
  QuestionController.postAnswer(req, res).catch(next);
});

export default router;
