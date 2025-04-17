import { Router } from "express";
import { RecommendationController } from "../controllers/recommendation.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const recommendationRouter = Router();

// All routes require authentication
recommendationRouter.use(AuthMiddleware.authenticateUser());

// Get recommended profiles
recommendationRouter.get("/", RecommendationController.getRecommendedUsers);

export default recommendationRouter;
