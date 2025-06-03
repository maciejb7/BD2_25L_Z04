import { Router } from "express";
import {
  deleteAccount,
  login,
  logout,
  logoutFromAllDevices,
  refresh,
  register,
} from "../controllers/auth.controller";
import { authenticateUser } from "../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.delete("/logout", authenticateUser(), logout);
authRouter.post("/refresh", refresh);
authRouter.post("/delete-account", authenticateUser(), deleteAccount);
authRouter.delete(
  "/logout-from-all-devices",
  authenticateUser(),
  logoutFromAllDevices,
);
export default authRouter;
