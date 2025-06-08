import { Router } from "express";
import authRouter from "./auth.router";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AdminController } from "../controllers/admin.controller";

const adminRouter = Router();

authRouter.get(
  "/user/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserDetailsByAdmin,
);

authRouter.get(
  "/users",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUsersDetailsByAdmin,
);

export default adminRouter;
