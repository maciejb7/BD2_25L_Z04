import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  changeUserInfoField,
  changeUserPassword,
  deleteUserAvatar,
  getUserAvatar,
  getUserInfo,
  uploadUserAvatar,
} from "../controllers/user.controller";
import { uploadSingleFile } from "../middlewares/file.middleware";

const userRouter = Router();

userRouter.get("/", authenticateUser(), getUserInfo);

userRouter.get("/avatar", authenticateUser(), getUserAvatar);

userRouter.post(
  "/avatar/upload",
  authenticateUser(),
  uploadSingleFile({
    formField: "avatar",
    allowedMimeTypes: ["image/jpeg"],
  }),
  uploadUserAvatar,
);

userRouter.delete("/avatar/delete", authenticateUser(), deleteUserAvatar);

userRouter.post("/change-info", authenticateUser(), changeUserInfoField);

userRouter.post("/change-password", authenticateUser(), changeUserPassword);

export default userRouter;
