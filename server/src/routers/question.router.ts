import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";

const router = Router();

router.get("/random", QuestionController.getRandom);
router.post("/answer", (req, res, next) => {
  QuestionController.postAnswer(req, res).catch(next);
});

export default router;
