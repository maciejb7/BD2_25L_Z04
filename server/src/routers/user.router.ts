import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/user.controller";
import { FileMiddleware } from "../middlewares/file.middleware";

const userRouter = Router();

userRouter.get(
  "/",
  AuthMiddleware.authenticateUser(),
  UserController.getUserDetailsByUser,
);

userRouter.get(
  "/avatar",
  AuthMiddleware.authenticateUser(),
  UserController.getUserAvatarByUser,
);

userRouter.post(
  "/avatar/upload",
  AuthMiddleware.authenticateUser(),
  FileMiddleware.uploadSingleFile({
    formField: "avatar",
    allowedMimeTypes: ["image/jpeg"],
  }),
  UserController.uploadUserAvatarByUser,
);

userRouter.delete(
  "/avatar/delete",
  AuthMiddleware.authenticateUser(),
  UserController.deleteUserAvatarByUser,
);

userRouter.post(
  "/change-info",
  AuthMiddleware.authenticateUser(),
  UserController.changeDetailsFieldByUser,
);

userRouter.post("/reset-password-link", UserController.createResetPasswordLink);
userRouter.get(
  "/reset-password-link/:passwordResetLinkId",
  UserController.checkIfPasswordResetLinkExists,
);
userRouter.post("/reset-password", UserController.resetUserPasswordByUser);

userRouter.post(
  "/change-password",
  AuthMiddleware.authenticateUser(),
  UserController.changeUserPasswordbyUser,
);

userRouter.post(
  "/delete-account",
  AuthMiddleware.authenticateUser(),
  UserController.deleteAccountByUser,
);

export default userRouter;
