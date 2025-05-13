import { Request, Response } from "express";
import { HobbyService } from "../services/hobby.service";
import logger from "../logger";

export class HobbyController {
  /**
   * Get all hobby categories
   */
  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await HobbyService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      logger.error("Error fetching hobby categories", error);
      res.status(500).json({ message: "Error fetching hobby categories" });
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }

      const category = await HobbyService.getCategoryById(categoryId);

      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }

      res.status(200).json(category);
    } catch (error) {
      logger.error("Error fetching category", error);
      res.status(500).json({ message: "Error fetching category" });
    }
  }

  /**
   * Get all hobbies
   */
  static async getAllHobbies(req: Request, res: Response): Promise<void> {
    try {
      const hobbies = await HobbyService.getAllHobbies();
      res.status(200).json(hobbies);
    } catch (error) {
      logger.error("Error fetching hobbies", error);
      res.status(500).json({ message: "Error fetching hobbies" });
    }
  }

  /**
   * Get hobbies by category
   */
  static async getHobbiesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = parseInt(req.params.categoryId);

      if (isNaN(categoryId)) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }

      const hobbies = await HobbyService.getHobbiesByCategory(categoryId);
      res.status(200).json(hobbies);
    } catch (error) {
      logger.error("Error fetching hobbies by category", error);
      res.status(500).json({ message: "Error fetching hobbies by category" });
    }
  }

  /**
   * Get hobby by ID
   */
  static async getHobbyById(req: Request, res: Response): Promise<void> {
    try {
      const hobbyId = parseInt(req.params.hobbyId);

      if (isNaN(hobbyId)) {
        res.status(400).json({ message: "Invalid hobby ID" });
        return;
      }

      const hobby = await HobbyService.getHobbyById(hobbyId);

      if (!hobby) {
        res.status(404).json({ message: "Hobby not found" });
        return;
      }

      res.status(200).json(hobby);
    } catch (error) {
      logger.error("Error fetching hobby", error);
      res.status(500).json({ message: "Error fetching hobby" });
    }
  }

  /**
   * Get current user's hobbies
   */
  static async getCurrentUserHobbies(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as { userId: string };
      const userHobbies = await HobbyService.getUserHobbies(userId);
      res.status(200).json(userHobbies);
    } catch (error) {
      logger.error("Error fetching user hobbies", error);
      res.status(500).json({ message: "Error fetching user hobbies" });
    }
  }

  /**
   * Rate a hobby for the current user
   */
  static async rateHobby(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as { userId: string };
      const { hobbyId, rating } = req.body;

      if (!hobbyId || !rating) {
        res.status(400).json({ message: "Hobby ID and rating are required" });
        return;
      }

      if (typeof rating !== 'number' || rating < 1 || rating > 10) {
        res.status(400).json({ message: "Rating must be a number between 1 and 10" });
        return;
      }

      const userHobby = await HobbyService.rateHobby(
        userId,
        parseInt(hobbyId),
        rating
      );

      res.status(200).json({
        message: "Hobby rating saved successfully",
        userHobby
      });
    } catch (error) {
      logger.error("Error rating hobby", error);
      res.status(500).json({ message: "Error rating hobby" });
    }
  }

  /**
   * Remove a hobby rating for the current user
   */
  static async removeHobbyRating(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.user as { userId: string };
      const hobbyId = parseInt(req.params.hobbyId);

      if (isNaN(hobbyId)) {
        res.status(400).json({ message: "Invalid hobby ID" });
        return;
      }

      const result = await HobbyService.removeHobbyRating(userId, hobbyId);

      if (!result) {
        res.status(404).json({ message: "Hobby rating not found" });
        return;
      }

      res.status(200).json({ message: "Hobby rating removed successfully" });
    } catch (error) {
      logger.error("Error removing hobby rating", error);
      res.status(500).json({ message: "Error removing hobby rating" });
    }
  }

  /**
   * Get a specific user's hobbies (admin only)
   */
  static async getUserHobbies(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const userHobbies = await HobbyService.getUserHobbies(userId);
      res.status(200).json(userHobbies);
    } catch (error) {
      logger.error("Error fetching user hobbies", error);
      res.status(500).json({ message: "Error fetching user hobbies" });
    }
  }

  /**
   * Get users by hobby (admin only)
   */
  static async getUsersByHobby(req: Request, res: Response): Promise<void> {
    try {
      const hobbyId = parseInt(req.params.hobbyId);

      if (isNaN(hobbyId)) {
        res.status(400).json({ message: "Invalid hobby ID" });
        return;
      }

      const users = await HobbyService.getUsersByHobby(hobbyId);
      res.status(200).json(users);
    } catch (error) {
      logger.error("Error fetching users by hobby", error);
      res.status(500).json({ message: "Error fetching users by hobby" });
    }
  }
}