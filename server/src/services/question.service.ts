import { questions } from "../db/models/question";
import { answers, Answer } from "../db/models/answer";

export const getRandomQuestions = (count: number) => {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const saveAnswer = (
  userId: string,
  questionId: string,
  answer: string,
) => {
  const newAnswer: Answer = { userId, questionId, answer };
  answers.push(newAnswer);
  return newAnswer;
};

export const getAnswersByUser = (userId: string) => {
  return answers.filter((a) => a.userId === userId);
};

export const getAnswersByQuestion = (questionId: string) => {
  return answers.filter((a) => a.questionId === questionId);
};

export const getAllAnswers = () => {
  return answers;
};
