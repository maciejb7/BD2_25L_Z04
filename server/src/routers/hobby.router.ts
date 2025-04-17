import { Router } from "express";
import { HobbyController } from "../controllers/hobby.controller";

const router = Router();

router.get("/categories", HobbyController.getCategories);
router.get("/hobbys", HobbyController.getHobbys);
router.get("/hobby/category/:categoryID", (req, res, next) => {
  HobbyController.getHobbyByCategory(req, res).catch(next);
});
router.get("/hobby/id/:hobbyID", (req, res, next) => {
  HobbyController.getHobbyByID(req, res).catch(next);
});
router.get("/category/:categoryId", (req, res, next) => {
  HobbyController.getCategoryByID(req, res).catch(next);
});

export default router;
