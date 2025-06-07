import { questions } from "../db/models/question";
import { Answer } from "../db/models/answer";
import { User } from "../db/models/user";

const getRandomQuestions = (count: number) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const saveAnswer = async (
  userId: string,
  questionId: string,
  answer: string,
): Promise<Answer> => {
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
    ],
    order: [["createdAt", "DESC"]],
  });
};

/**
 
Get user's answers for specific questions
@param userId User ID
@param questionIds Array of question IDs
@returns Promise with user's answers for specified questions*/
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
  getRandomQuestions,
  saveAnswer,
  getAnswersByUser,
  getAnswersByQuestion,
  getAllAnswers,
  getUserAnswersForQuestions,
};
