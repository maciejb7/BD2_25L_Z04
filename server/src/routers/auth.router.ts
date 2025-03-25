import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.delete(
  "/logout",
  AuthMiddleware.authenticateUser(),
  AuthController.logout,
);
authRouter.post("/refresh", AuthController.refresh);
export default authRouter;
