import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { FileMiddleware } from "../middlewares/file.middleware";

const userRouter = Router();

userRouter.get(
  "/",
  AuthMiddleware.authenticateUser(),
  UserController.getUserInfo,
);

userRouter.get(
  "/avatar",
  AuthMiddleware.authenticateUser(),
  UserController.getUserAvatar,
);

userRouter.post(
  "/avatar/upload",
  AuthMiddleware.authenticateUser(),
  FileMiddleware.uploadSingleFile({
    formField: "avatar",
    allowedMimeTypes: ["image/jpeg"],
  }),
  UserController.uploadUserAvatar,
);

userRouter.delete(
  "/avatar/delete",
  AuthMiddleware.authenticateUser(),
  UserController.deleteUserAvatar,
);

userRouter.post(
  "/change-info",
  AuthMiddleware.authenticateUser(),
  UserController.changeUserInfoField,
);

userRouter.post(
  "/change-password",
  AuthMiddleware.authenticateUser(),
  UserController.changeUserPassword,
);

export default userRouter;
