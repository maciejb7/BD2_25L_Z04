import { Router } from "express";
import { UserInteractionController } from "../controllers/user-interaction.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const userInteractionRouter = Router();

// All routes require authentication
userInteractionRouter.use(AuthMiddleware.authenticateUser());

// Record a like / dislike
userInteractionRouter.post("/", UserInteractionController.recordInteraction);

// Get matches
userInteractionRouter.get("/matches", UserInteractionController.getUserMatches);

export default userInteractionRouter;
