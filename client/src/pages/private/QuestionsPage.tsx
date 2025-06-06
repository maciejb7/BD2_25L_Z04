import { useState, useEffect } from "react";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { getRandomQuestions, submitAnswer } from "../../api/api.questions";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";

interface Question {
  id: string;
  content: string;
}

interface Answer {
  questionId: string;
  answer: string;
}

function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchQuestionsAndUser = async () => {
      console.log("🔄 Rozpoczynam ładowanie pytań i użytkownika...");
      try {
        setIsLoading(true);
        setError("");

        // Pobierz użytkownika
        console.log("👤 Pobieram dane użytkownika...");
        const user = await getUser();
        console.log("✅ Użytkownik pobrany:", user);

        // Sprawdź czy user ma id
        if (!user || !user.userId) {
          throw new Error("Nie udało się pobrać ID użytkownika");
        }

        setUserId(user.userId);

        // Pobierz pytania
        console.log("❓ Pobieram pytania...");
        const questionsData = await getRandomQuestions(5);
        console.log("✅ Pytania pobrane:", questionsData);

        if (!questionsData || questionsData.length === 0) {
          throw new Error("Nie udało się pobrać pytań");
        }

        setQuestions(questionsData);
        console.log("🎉 Inicjalizacja zakończona pomyślnie");
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

    fetchQuestionsAndUser();
  }, [showAlert]);

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) {
      showAlert("Proszę podać odpowiedź", "info");
      return;
    }

    console.log("💾 Zapisuję odpowiedź...", {
      userId,
      questionId: questions[currentQuestionIndex]?.id,
      currentAnswer: currentAnswer.trim(),
    });

    try {
      setIsSubmitting(true);
      const currentQuestion = questions[currentQuestionIndex];

      if (!currentQuestion) {
        throw new Error("Brak aktualnego pytania");
      }

      if (!userId) {
        throw new Error("Brak ID użytkownika");
      }

      const result = await submitAnswer({
        userId,
        questionId: currentQuestion.id,
        answer: currentAnswer.trim(),
      });

      console.log("✅ Odpowiedź zapisana:", result);

      // Dodaj odpowiedź do lokalnej listy
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          answer: currentAnswer.trim(),
        },
      ]);

      // Przejdź do następnego pytania lub zakończ
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentAnswer("");
        showAlert("Odpowiedź zapisana!", "success");
      } else {
        showAlert("Wszystkie pytania zostały ukończone!", "success");
      }
    } catch (error: any) {
      console.error("❌ Błąd podczas zapisywania odpowiedzi:", error);
      const errorMessage =
        error?.message || "Błąd podczas zapisywania odpowiedzi";
      showAlert(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      // Załaduj poprzednią odpowiedź jeśli istnieje
      const prevAnswer = answers.find(
        (a) => a.questionId === questions[currentQuestionIndex - 1].id,
      );
      setCurrentAnswer(prevAnswer?.answer || "");
    }
  };

  const isCompleted =
    currentQuestionIndex >= questions.length && questions.length > 0;
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + (isCompleted ? 0 : 0)) / questions.length) *
        100
      : 0;

  console.log("🐛 Debug info:", {
    questionsLength: questions.length,
    currentQuestionIndex,
    isCompleted,
    isLoading,
    error,
    userId,
  });

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

  return (
    <div className="relative min-h-screen flex">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Pytania")} />
        <div className="ml-12 sm:ml-16 py-8 px-4 max-w-4xl mx-auto">
          <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
            <i className="fas fa-question-circle"></i>Pytania
          </h2>

          {/* Debug info - usuń w produkcji */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            Debug: Pytań: {questions.length}, Aktualny indeks:{" "}
            {currentQuestionIndex}, Ukończone: {isCompleted ? "Tak" : "Nie"}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Postęp</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!isCompleted ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Pytanie {currentQuestionIndex + 1} z {questions.length}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {questions[currentQuestionIndex]?.content}
                </h3>
              </div>

              <div className="mb-6">
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Napisz swoją odpowiedź..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0 || isSubmitting}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Poprzednie
                </button>

                <button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Zapisywanie...
                    </>
                  ) : currentQuestionIndex === questions.length - 1 ? (
                    <>
                      <i className="fas fa-check mr-2"></i>Zakończ
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-right mr-2"></i>Następne
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="mb-6">
                <i className="fas fa-check-circle text-green-500 text-6xl mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Gratulacje!
                </h3>
                <p className="text-gray-600">
                  Ukończyłeś wszystkie pytania. Twoje odpowiedzi zostały
                  zapisane.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Podsumowanie Twoich odpowiedzi:
                </h4>
                <div className="space-y-3 text-left">
                  {questions.map((question) => {
                    const answer = answers.find(
                      (a) => a.questionId === question.id,
                    );
                    return (
                      <div
                        key={question.id}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <p className="font-medium text-gray-800">
                          {question.content}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {answer?.answer || "Brak odpowiedzi"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>Rozpocznij ponownie
              </button>
            </div>
          )}
        </div>
      </Background>
    </div>
  );
}

export default QuestionsPage;
