import { Router } from "express";
import { HobbyController } from "../controllers/hobby.controller";
import {
  authenticateUser,
  authorizeRole,
} from "../middlewares/auth.middleware";

const hobbyRouter = Router();

// PUBLIC ROUTES

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

// PROTECTED ROUTES

// User hobby routes
hobbyRouter.use("/user", authenticateUser());

// Get current user's hobbies
hobbyRouter.get("/user/hobbies", HobbyController.getCurrentUserHobbies);

// Rate a hobby
hobbyRouter.post("/user/hobbies/rate", HobbyController.rateHobby);

// Remove a hobby rating
hobbyRouter.delete("/user/hobbies/:hobbyId", HobbyController.removeHobbyRating);

// Get a specific user's hobbies (admin only)
hobbyRouter.get("/admin/users/:userId/hobbies", HobbyController.getUserHobbies);

// ADMIN ROUTES

// Admin routes
const adminRouter = Router();
adminRouter.use(authenticateUser());
adminRouter.use(authorizeRole("admin"));

// Get users by hobby (admin only)
adminRouter.get(
  "/admin/hobbies/:hobbyId/users",
  HobbyController.getUsersByHobby,
);

// Add admin routes to the main router
hobbyRouter.use("/", adminRouter);

export default hobbyRouter;
