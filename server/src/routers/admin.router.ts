import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AdminController } from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.get(
  "/user/:userId",
  AuthMiddleware.authenticateUser(),
  AuthMiddleware.authorizeRole("admin"),
  AdminController.getUserDetailsByAdmin,
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

export default adminRouter;
