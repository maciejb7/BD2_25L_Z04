import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AdminController } from "../controllers/admin.controller";
import { FileMiddleware } from "../middlewares/file.middleware";

const adminRouter = Router();

adminRouter.get(
  "/user/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserDetailsByAdmin,
);

adminRouter.get(
  "/user/ban-status/:bannedUserId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserBanByAdmin,
);

adminRouter.get(
  "/user/avatar/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserAvatarByAdmin,
);

adminRouter.post(
  "/user/avatar/upload/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  FileMiddleware.uploadSingleFile({
    formField: "avatar",
    allowedMimeTypes: ["image/jpeg"],
  }),
  AdminController.uploadUserAvatarByAdmin,
);

adminRouter.delete(
  "/user/avatar/delete/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.deleteUserAvatarByAdmin,
);

adminRouter.get(
  "/user/ban/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserBanByAdmin,
);

adminRouter.get(
  "/users",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUsersDetailsByAdmin,
);

adminRouter.delete(
  "/user/delete/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.deleteUserAccountByAdmin,
);

adminRouter.post(
  "/user/ban",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.banUserAccount,
);

adminRouter.delete(
  "/user/unban/:userToUnbanId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.unbanUserAccount,
);

adminRouter.post(
  "/user/change-info/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.changeDetailsFieldByAdmin,
);

export default adminRouter;
