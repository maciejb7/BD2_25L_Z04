import { Router } from "express";
import { UserHobbyController } from "../controllers/userHobby.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/all", UserHobbyController.getAll);
router.get(
  "/hobbys/user/:userId",
  AuthMiddleware.authenticateUser(),
  (req, res, next) => {
    UserHobbyController.getHobbyByUser(req, res).catch(next);
  },
);
router.get(
  "/users/user/:userID",
  AuthMiddleware.authenticateUser(),
  (req, res, next) => {
    UserHobbyController.getHobbyByUser(req, res).catch(next);
  },
);
router.get(
  "/hobby/details/:userID",
  AuthMiddleware.authenticateUser(),
  (req, res, next) => {
    UserHobbyController.getUserHobbyInformation(req, res).catch(next);
  },
);
router.post("/add", AuthMiddleware.authenticateUser(), (req, res, next) => {
  UserHobbyController.addUserHobby(req, res).catch(next);
});

export default router;
