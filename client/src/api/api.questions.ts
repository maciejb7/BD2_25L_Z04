import api, { handleApiError } from "./api";
import { AxiosResponse } from "axios";

interface Question {
  id: string;
  content: string;
}

interface AnswerRequest {
  userId: string;
  questionId: string;
  answer: string;
}

interface Answer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pobiera wszystkie pytania z API w losowej kolejności
 * @returns Promise z tablicą pytań
 */
export const getAllQuestions = async (): Promise<Question[]> => {
  try {
    const response: AxiosResponse<Question[]> = await api.get("api/questions/");
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania pytań");
    throw error;
  }
};

/**
 * Wysyła odpowiedź na pytanie
 * @param answerData Dane odpowiedzi
 * @returns Promise z zapisaną odpowiedzią
 */
export const submitAnswer = async (
  answerData: AnswerRequest,
): Promise<Answer> => {
  try {
    const response: AxiosResponse<Answer> = await api.post(
      "api/questions/answer",
      answerData,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas zapisywania odpowiedzi");
    throw error;
  }
};

/**
 * Pobiera odpowiedzi użytkownika
 * @param userId ID użytkownika
 * @returns Promise z tablicą odpowiedzi użytkownika
 */
export const getUserAnswers = async (userId: string): Promise<Answer[]> => {
  try {
    const response: AxiosResponse<Answer[]> = await api.get(
      `api/questions/answers/user/${userId}`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania odpowiedzi");
    throw error;
  }
};

/**
 * Pobiera odpowiedzi na konkretne pytanie
 * @param questionId ID pytania
 * @returns Promise z tablicą odpowiedzi na pytanie
 */
export const getQuestionAnswers = async (
  questionId: string,
): Promise<Answer[]> => {
  try {
    const response: AxiosResponse<Answer[]> = await api.get(
      `api/questions/answers/question/${questionId}`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania odpowiedzi");
    throw error;
  }
};

/**
 * Pobiera wszystkie odpowiedzi
 * @returns Promise z tablicą wszystkich odpowiedzi
 */
export const getAllAnswers = async (): Promise<Answer[]> => {
  try {
    const response: AxiosResponse<Answer[]> = await api.get(
      "api/questions/answers",
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania odpowiedzi");
    throw error;
  }
};

/**
 * Pobiera odpowiedzi użytkownika dla konkretnych pytań
 * @param questionIds Array ID pytań
 * @returns Promise z tablicą odpowiedzi użytkownika
 */
export const getUserAnswersForQuestions = async (
  questionIds: string[],
): Promise<Answer[]> => {
  try {
    const response: AxiosResponse<Answer[]> = await api.post(
      "api/questions/user-answers-for-questions",
      { questionIds },
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania odpowiedzi użytkownika");
    throw error;
  }
};
