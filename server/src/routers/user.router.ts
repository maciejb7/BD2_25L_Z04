import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.get("/", AuthMiddleware.authenticateUser(), UserController.getUserInfo);

export default userRouter;