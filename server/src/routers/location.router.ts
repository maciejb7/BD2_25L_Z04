import { Router } from "express";
import { LocationController } from "../controllers/location.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const locationRouter = Router();

locationRouter.use(AuthMiddleware.authenticateUser());

// Get distance to another user (must come before /:userId route to avoid conflict)
locationRouter.get("/distance/:userId", LocationController.getDistanceToUser);

// Set/update current user's location
locationRouter.post("/", LocationController.setLocation);

// Get current user's location
locationRouter.get("/", LocationController.getCurrentUserLocation);

// Delete current user's location
locationRouter.delete("/", LocationController.deleteLocation);

// Get another user's location
locationRouter.get("/:userId", LocationController.getUserLocation);

export default locationRouter;