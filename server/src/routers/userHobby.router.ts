import { Router } from "express";
import { UserHobbyController } from "../controllers/userHobby.controller";

const router = Router();

router.get("/all", UserHobbyController.getAll);
router.get("/hobbys/user/:userId", (req, res, next) => {
  UserHobbyController.getHobbyByUser(req, res).catch(next);
});
router.get("/users/user/:userID", (req, res, next) => {
  UserHobbyController.getHobbyByUser(req, res).catch(next);
});
router.get("/hobby/details/:userID", (req, res, next) => {
  UserHobbyController.getUserHobbyInformation(req, res).catch(next);
});
router.post("/add", (req, res, next) => {
  UserHobbyController.addUserHobby(req, res).catch(next);
});

export default router;
