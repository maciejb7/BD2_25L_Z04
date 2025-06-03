import { Router } from "express";
import { MatchPreferenceController } from "../controllers/match-preference.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const matchPreferenceRouter = Router();

// PUBLIC ROUTES

// Get all match types
matchPreferenceRouter.get("/types", MatchPreferenceController.getAllMatchTypes);

// PROTECTED ROUTES

// User match preferences
matchPreferenceRouter.get(
  "/user",
  authenticateUser(),
  MatchPreferenceController.getUserMatchPreferences,
);

matchPreferenceRouter.put(
  "/user",
  authenticateUser(),
  MatchPreferenceController.updateUserMatchPreferences,
);

export default matchPreferenceRouter;
