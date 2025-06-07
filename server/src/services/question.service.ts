import { Question, questionsData } from "../db/models/question";
import { Answer } from "../db/models/answer";
import { User } from "../db/models/user";
import { database } from "../db/database";
import logger from "../logger";

/**
 * Initialize questions data in the database
 */
const initializeQuestionsData = async (): Promise<void> => {
  const transaction = await database.transaction();
  try {
    // Check if questions exist, if not create them
    const questionCount = await Question.count();
    if (questionCount === 0) {
      logger.info("Initializing questions data");
      await Question.bulkCreate(questionsData, { transaction });
    }

    await transaction.commit();
    logger.info("Questions data initialized successfully");
  } catch (error) {
    await transaction.rollback();
    logger.error("Error initializing questions data", error);
    throw error;
  }
};

/**
 * Get all active questions in random order
 */
const getAllQuestions = async (): Promise<Question[]> => {
  const questions = await Question.findAll({
    where: { is_active: true },
    order: [["display_order", "ASC"]],
  });

  // Shuffle the questions array
  return shuffleArray([...questions]);
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const saveAnswer = async (
  userId: string,
  questionId: string,
  answer: string,
): Promise<Answer> => {
  // Verify that the question exists
  const question = await Question.findByPk(questionId);
  if (!question) {
    throw new Error(`Question with id ${questionId} does not exist`);
  }

  // Use findOrCreate to either create new answer or update existing one
  const [answerRecord, created] = await Answer.findOrCreate({
    where: {
      userId,
      questionId,
    },
    defaults: {
      userId,
      questionId,
      answer,
    },
  });

  // If the answer already existed, update it
  if (!created) {
    answerRecord.answer = answer;
    await answerRecord.save();
  }

  return answerRecord;
};

const getAnswersByUser = async (userId: string): Promise<Answer[]> => {
  return await Answer.findAll({
    where: { userId },
    include: [
      {
        model: User,
        attributes: ["userId", "nickname", "name", "surname"],
      },
      {
        model: Question,
        attributes: ["id", "content"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getAnswersByQuestion = async (questionId: string): Promise<Answer[]> => {
  return await Answer.findAll({
    where: { questionId },
    include: [
      {
        model: User,
        attributes: ["userId", "nickname", "name", "surname"],
      },
      {
        model: Question,
        attributes: ["id", "content"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const getAllAnswers = async (): Promise<Answer[]> => {
  return await Answer.findAll({
    include: [
      {
        model: User,
        attributes: ["userId", "nickname", "name", "surname"],
      },
      {
        model: Question,
        attributes: ["id", "content"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

/**
 * Get user's answers for specific questions
 * @param userId User ID
 * @param questionIds Array of question IDs
 * @returns Promise with user's answers for specified questions
 */
const getUserAnswersForQuestions = async (
  userId: string,
  questionIds: string[],
): Promise<Answer[]> => {
  return await Answer.findAll({
    where: {
      userId,
      questionId: questionIds,
    },
    order: [["updatedAt", "ASC"]],
  });
};

export const QuestionService = {
  initializeQuestionsData,
  getAllQuestions,
  saveAnswer,
  getAnswersByUser,
  getAnswersByQuestion,
  getAllAnswers,
  getUserAnswersForQuestions,
};
