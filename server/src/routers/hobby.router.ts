import { Router } from "express";
import { HobbyController } from "../controllers/hobby.controller";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/auth.middleware";

const hobbyRouter = Router();

// PUBLIC ROUTES - te muszą być przed middleware uwierzytelniającym

// Get all categories
hobbyRouter.get("/categories", HobbyController.getAllCategories);

// Get category by ID
hobbyRouter.get("/categories/:categoryId", HobbyController.getCategoryById);

// Get all hobbies
hobbyRouter.get("/hobbies", HobbyController.getAllHobbies);

// Get hobbies by category
hobbyRouter.get(
  "/categories/:categoryId/hobbies",
  HobbyController.getHobbiesByCategory,
);

// Get hobby by ID
hobbyRouter.get("/hobbies/:hobbyId", HobbyController.getHobbyById);

// PROTECTED USER ROUTES

// Get current user's hobbies
hobbyRouter.get(
  "/user/hobbies",
  authenticateUser(),
  HobbyController.getCurrentUserHobbies,
);

// Rate a hobby
hobbyRouter.post(
  "/user/hobbies/rate",
  authenticateUser(),
  HobbyController.rateHobby,
);

// Remove a hobby rating
hobbyRouter.delete(
  "/user/hobbies/:hobbyId",
  authenticateUser(),
  HobbyController.removeHobbyRating,
);

// ADMIN ROUTES

// Get a specific user's hobbies (admin only)
hobbyRouter.get(
  "/admin/users/:userId/hobbies",
  authenticateUser(),
  authorizeRole("admin"),
  HobbyController.getUserHobbies,
);

// Get users by hobby (admin only)
hobbyRouter.get(
  "/admin/hobbies/:hobbyId/users",
  authenticateUser(),
  authorizeRole("admin"),
  HobbyController.getUsersByHobby,
);

export default hobbyRouter;
