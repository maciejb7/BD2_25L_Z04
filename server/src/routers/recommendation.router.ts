import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const recommendationRouter = Router();

// All routes require authentication
recommendationRouter.use(authenticateUser());

// Get recommended profiles
recommendationRouter.get("/", RecommendationController.getRecommendedUsers);

export default recommendationRouter;
