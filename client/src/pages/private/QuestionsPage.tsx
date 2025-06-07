import { useState, useEffect } from "react";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import {
  getAllQuestions,
  submitAnswer,
  getUserAnswersForQuestions,
} from "../../api/api.questions";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";

interface Question {
  id: string;
  content: string;
}

interface Answer {
  id: string;
  userId: string;
  questionId: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAnswer {
  questionId: string;
  answer: string;
  isSaved: boolean;
}

function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {},
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { showAlert } = useAlert();

  // Load questions and existing answers on component mount
  useEffect(() => {
    const initializeQuestionsAndAnswers = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get user ID
        const user = await getUser();
        if (!user || !user.userId) {
          throw new Error("Nie udało się pobrać ID użytkownika");
        }
        setUserId(user.userId);

        // Get all questions in random order
        const questionsData = await getAllQuestions();
        if (!questionsData || questionsData.length === 0) {
          throw new Error("Nie udało się pobrać pytań");
        }
        setQuestions(questionsData);

        // Get existing answers for these questions
        const questionIds = questionsData.map((q) => q.id);
        const existingAnswers = await getUserAnswersForQuestions(questionIds);

        // Create answers map with existing answers
        const answersMap: Record<string, UserAnswer> = {};
        questionsData.forEach((question) => {
          const existingAnswer = existingAnswers.find(
            (a) => a.questionId === question.id,
          );
          answersMap[question.id] = {
            questionId: question.id,
            answer: existingAnswer?.answer || "",
            isSaved: !!existingAnswer,
          };
        });
        setUserAnswers(answersMap);
      } catch (error: any) {
        console.error("❌ Błąd podczas inicjalizacji:", error);
        const errorMessage =
          error?.message || "Nieznany błąd podczas ładowania";
        setError(errorMessage);
        showAlert(errorMessage, "error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeQuestionsAndAnswers();
  }, [showAlert]);

  const handleAnswerChange = (questionId: string, newAnswer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: newAnswer,
        isSaved: false, // Mark as unsaved when changed
      },
    }));
  };

  const handleSaveAnswer = async (questionId: string) => {
    const userAnswer = userAnswers[questionId];
    if (!userAnswer || !userAnswer.answer.trim()) {
      showAlert("Proszę podać odpowiedź przed zapisaniem", "info");
      return;
    }

    try {
      setIsSubmitting(true);

      await submitAnswer({
        userId,
        questionId,
        answer: userAnswer.answer.trim(),
      });

      // Mark answer as saved
      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          isSaved: true,
        },
      }));

      showAlert("Odpowiedź zapisana!", "success");
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisywania odpowiedzi:", error);
      const errorMessage =
        error?.message || "Błąd podczas zapisywania odpowiedzi";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAllAnswers = async () => {
    const unsavedAnswers = Object.values(userAnswers).filter(
      (answer) => answer.answer.trim() && !answer.isSaved,
    );

    if (unsavedAnswers.length === 0) {
      showAlert("Wszystkie odpowiedzi są już zapisane", "info");
      return;
    }

    try {
      setIsSubmitting(true);

      for (const userAnswer of unsavedAnswers) {
        await submitAnswer({
          userId,
          questionId: userAnswer.questionId,
          answer: userAnswer.answer.trim(),
        });
      }

      // Mark all answers as saved
      setUserAnswers((prev) => {
        const updated = { ...prev };
        unsavedAnswers.forEach((answer) => {
          updated[answer.questionId] = {
            ...updated[answer.questionId],
            isSaved: true,
          };
        });
        return updated;
      });

      showAlert(`Zapisano ${unsavedAnswers.length} odpowiedzi!`, "success");
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisywania odpowiedzi:", error);
      const errorMessage =
        error?.message || "Błąd podczas zapisywania odpowiedzi";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const getTotalAnsweredCount = () => {
    return Object.values(userAnswers).filter((answer) => answer.answer.trim())
      .length;
  };

  const getUnsavedCount = () => {
    return Object.values(userAnswers).filter(
      (answer) => answer.answer.trim() && !answer.isSaved,
    ).length;
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex">
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Pytania")} />
          <div className="ml-12 sm:ml-16 py-8 px-4 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie pytań...</p>
            </div>
          </div>
        </Background>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex">
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Pytania")} />
          <div className="ml-12 sm:ml-16 py-8 px-4 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Wystąpił błąd
                </h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Spróbuj ponownie
                </button>
              </div>
            </div>
          </div>
        </Background>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="relative min-h-screen flex">
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Pytania")} />
          <div className="ml-12 sm:ml-16 py-8 px-4 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
              <i className="fas fa-question-circle text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Brak pytań
              </h3>
              <p className="text-gray-600">
                Nie udało się załadować pytań z serwera.
              </p>
            </div>
          </div>
        </Background>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestion.id];
  const unsavedCount = getUnsavedCount();

  return (
    <div className="relative min-h-screen flex">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Pytania")} />
        <div className="ml-12 sm:ml-16 py-8 px-4 max-w-4xl mx-auto">
          <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
            <i className="fas fa-question-circle"></i>Pytania
          </h2>

          {/* Statistics */}
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Pytania:</span>
                <span>{questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Odpowiedzi:</span>
                <span>
                  {getTotalAnsweredCount()}/{questions.length}
                </span>
              </div>
              {unsavedCount > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span className="font-medium">Niezapisane:</span>
                  <span>{unsavedCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigation */}
          <div className="mb-6 flex flex-wrap gap-2">
            {questions.map((_, index) => {
              const questionId = questions[index].id;
              const answer = userAnswers[questionId];
              const hasAnswer = answer?.answer.trim();
              const isSaved = answer?.isSaved;

              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-blue-600 text-white"
                      : hasAnswer
                        ? isSaved
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                  {hasAnswer && (
                    <i
                      className={`ml-1 fas ${isSaved ? "fa-check" : "fa-edit"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Question */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">
                Pytanie {currentQuestionIndex + 1} z {questions.length}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {currentQuestion.content}
              </h3>
            </div>

            <div className="mb-6">
              <textarea
                value={currentAnswer?.answer || ""}
                onChange={(e) =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                placeholder="Napisz swoją odpowiedź..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
              />
              {currentAnswer &&
                !currentAnswer.isSaved &&
                currentAnswer.answer.trim() && (
                  <p className="text-sm text-orange-600 mt-2">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Ta odpowiedź nie została jeszcze zapisana
                  </p>
                )}
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Poprzednie
                </button>

                <button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Następne<i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveAnswer(currentQuestion.id)}
                  disabled={
                    isSubmitting ||
                    !currentAnswer?.answer.trim() ||
                    currentAnswer.isSaved
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Zapisuję...
                    </>
                  ) : currentAnswer?.isSaved ? (
                    <>
                      <i className="fas fa-check mr-2"></i>Zapisane
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>Zapisz
                    </>
                  )}
                </button>

                {unsavedCount > 0 && (
                  <button
                    onClick={handleSaveAllAnswers}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Zapisuję wszystkie...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Zapisz wszystkie ({unsavedCount})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {getTotalAnsweredCount() === questions.length &&
            unsavedCount === 0 && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                  <div>
                    <h4 className="font-semibold text-green-800">
                      Wszystkie pytania zostały ukończone!
                    </h4>
                    <p className="text-green-600 text-sm">
                      Odpowiedziałeś na wszystkie pytania i wszystko zostało
                      zapisane.
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Background>
    </div>
  );
}

export default QuestionsPage;
