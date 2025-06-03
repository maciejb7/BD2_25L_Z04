import { questions } from "../db/models/question";
import { answers, Answer } from "../db/models/answer";

const getRandomQuestions = (count: number) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const saveAnswer = (userId: string, questionId: string, answer: string) => {
  const newAnswer: Answer = { userId, questionId, answer };
  answers.push(newAnswer);
  return newAnswer;
};

const getAnswersByUser = (userId: string) => {
  return answers.filter((a) => a.userId === userId);
};
const getAnswersByQuestion = (questionId: string) => {
  return answers.filter((a) => a.questionId === questionId);
};

const getAllAnswers = () => {
  return answers;
};

export const QuestionService = {
  getRandomQuestions,
  saveAnswer,
  getAnswersByUser,
  getAnswersByQuestion,
  getAllAnswers,
};
