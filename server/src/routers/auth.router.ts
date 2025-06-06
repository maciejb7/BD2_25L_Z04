import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.delete(
  "/logout",
  AuthMiddleware.authenticateUser(),
  AuthController.logout,
);
authRouter.post("/refresh", AuthController.refresh);
authRouter.delete(
  "/logout-from-all-devices",
  AuthMiddleware.authenticateUser(),
  AuthController.logoutFromAllDevices,
);
export default authRouter;
