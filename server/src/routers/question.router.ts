import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";

const router = Router();

router.get("/random", QuestionController.getRandom);
router.get("/answers", (req, res, next) => {
  QuestionController.getAllAnswers(req, res).catch(next);
});
router.get("/answers/user/:userId", (req, res, next) => {
  QuestionController.getAnswersByUser(req, res).catch(next);
});
router.get("/answers/question/:questionId", (req, res, next) => {
  QuestionController.getAnswersByQuestion(req, res).catch(next);
});
router.post("/answer", (req, res, next) => {
  QuestionController.postAnswer(req, res).catch(next);
});

export default router;
