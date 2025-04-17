import { questions } from "../db/models/question";
import { answers, Answer } from "../db/models/answer";

export function getRandomQuestions(count: number) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function saveAnswer(userId: string, questionId: string, answer: string) {
  const newAnswer: Answer = { userId, questionId, answer };
  answers.push(newAnswer);
  return newAnswer;
}

export function getAnswersByUser(userId: string) {
  return answers.filter((a) => a.userId === userId);
}

export function getAnswersByQuestion(questionId: string) {
  return answers.filter((a) => a.questionId === questionId);
}

export function getAllAnswers() {
  return answers;
}
