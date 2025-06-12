import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import { getAllHobby, getAllHobbyCategories, getHobbyByCategory, getUserHobbies, rateHobby, removeHobbyRating } from "../../api/api.hobbys";
import { Hobby, Category } from "../../api/api.hobbys";

// Typ dla hobby użytkownika z oceną
interface UserHobby {
  id: string;
  userId: string;
  hobbyId: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  hobby: Hobby;
}

function HobbyPage() {
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [selectedHobby, setSelectedHobby] = useState<Hobby[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [userHobbies, setUserHobbies] = useState<UserHobby[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [ratingsInProgress, setRatingsInProgress] = useState<{ [key: number]: boolean }>({});
  const { showAlert } = useAlert();
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initializeData = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        if (!user) throw new Error("Nie udało się pobrać ID użytkownika");

        const [hobbyRes, categoryRes] = await Promise.all([
          getAllHobby(),
          getAllHobbyCategories(),
        ]);

        // Pobieranie hobby użytkownika osobno, aby łatwiej debugować błędy
        let userHobbiesRes: UserHobby[] = [];
        try {
          console.log("Próba pobrania hobby użytkownika...");
          console.log("Dane użytkownika:", user);

          // Sprawdź czy api ma token autoryzacyjny
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          console.log("Token dostępny:", !!token);

          if (!token) {
            console.warn("Brak tokenu autoryzacyjnego - użytkownik nie jest zalogowany");
            throw new Error("Brak autoryzacji - zaloguj się ponownie");
          }

          userHobbiesRes = await getUserHobbies();
          console.log("Pomyślnie pobrano hobby użytkownika:", userHobbiesRes);
        } catch (userHobbyError: any) {
          console.error("Błąd podczas pobierania hobby użytkownika:", userHobbyError);
          console.error("Szczegóły błędu:", userHobbyError.response?.data || userHobbyError.message);

          if (userHobbyError.response?.status === 401) {
            showAlert("Sesja wygasła. Zaloguj się ponownie.", "error");
          } else {
            showAlert("Nie udało się pobrać Twoich hobby, ale możesz przeglądać dostępne opcje.", "info");
          }
        }

        if (!hobbyRes?.length) throw new Error("Brak dostępnych hobby");
        if (!categoryRes?.length) throw new Error("Brak kategorii hobby");

        setAllHobbies(hobbyRes);
        setAllCategories(categoryRes);
        setUserHobbies(userHobbiesRes || []); // Ustawienie hobby użytkownika

        const storedCatId = localStorage.getItem("selectedCategory");
        if (storedCatId) {
          const catId = parseInt(storedCatId);
          setSelectedCategory(catId);
          const cat = categoryRes.find(c => c.id === catId);
          if (cat) setSelectedCategoryName(cat.hobby_category_name);

          const hobbyByCat = await getHobbyByCategory(catId);
          setSelectedHobby(hobbyByCat);
        }
      } catch (err: any) {
        console.error("Błąd podczas inicjalizacji:", err);
        setError("Wystąpił problem z pobieraniem danych.");
        showAlert(`Błąd: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [showAlert]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryId = Number(e.target.value);
    localStorage.setItem("selectedCategory", newCategoryId.toString());
    window.location.reload();
  };

  const renderStars = (rating: number, interactive = false, hobbyId?: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span
          key={i}
          className={`${i <= rating ? "text-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-yellow-500 text-lg" : ""}`}
          onClick={interactive && hobbyId ? () => handleRateHobby(hobbyId, i) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleRateHobby = async (hobbyId: number, rating: number) => {
    try {
      setRatingsInProgress(prev => ({ ...prev, [hobbyId]: true }));

      await rateHobby(hobbyId, rating);


      const updatedUserHobbies = await getUserHobbies();
      setUserHobbies(updatedUserHobbies);

      showAlert(`Hobby zostało ocenione na ${rating}/10!`, "success");
    } catch (error: any) {
      console.error("Błąd podczas oceniania hobby:", error);
      showAlert("Wystąpił błąd podczas oceniania hobby. Spróbuj ponownie.", "error");
    } finally {
      setRatingsInProgress(prev => ({ ...prev, [hobbyId]: false }));
    }
  };

  const handleRemoveRating = async (hobbyId: number) => {
    try {
      setRatingsInProgress(prev => ({ ...prev, [hobbyId]: true }));

      await removeHobbyRating(hobbyId);

      const updatedUserHobbies = await getUserHobbies();
      setUserHobbies(updatedUserHobbies);

      showAlert("Ocena hobby została usunięta!", "success");
    } catch (error: any) {
      console.error("Błąd podczas usuwania oceny hobby:", error);
      showAlert("Wystąpił błąd podczas usuwania oceny hobby. Spróbuj ponownie.", "error");
    } finally {
      setRatingsInProgress(prev => ({ ...prev, [hobbyId]: false }));
    }
  };

  const getUserRatingForHobby = (hobbyId: number): number | null => {
    const userHobby = userHobbies.find(uh => uh.hobbyId === hobbyId);
    return userHobby ? userHobby.rating : null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Background blur="lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ładowanie danych...</p>
          </div>
        </Background>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <Background blur="lg">
        <div className="flex min-h-screen">
          <SideBar options={getSideBarOptions("Hobby")} />
          <main className="flex-1 px-4 py-6 ml-12 sm:ml-16 max-w-none">
            <div className="space-y-10 pb-10">
              <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
                <i className="fas fa-palette"></i>Twoje Hobby
              </h2>
              <hr className="my-6" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoje hobby</h2>

                {userHobbies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {userHobbies.map((userHobby) => (
                      <div
                        key={userHobby.id}
                        className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {userHobby.hobby.hobby_name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {userHobby.hobby.category.hobby_category_name}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{userHobby.hobby.hobby_description}</p>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium text-gray-700">Ocena:</span>
                            <div className="flex">{renderStars(userHobby.rating)}</div>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{userHobby.rating}/10</span>
                        </div>
                        <button
                          onClick={() => handleRemoveRating(userHobby.hobbyId)}
                          disabled={ratingsInProgress[userHobby.hobbyId]}
                          className="w-full mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {ratingsInProgress[userHobby.hobbyId] ? "Usuwanie..." : "Usuń ocenę"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center mb-8">
                    <p className="text-gray-600 text-lg">
                      Nie masz jeszcze żadnych ocenionych hobby.
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Wybierz kategorię poniżej, aby przeglądać dostępne hobby i dodać swoje oceny.
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-300 max-w-4xl mx-auto" />

              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Przeglądaj hobby</h2>

                <div className="flex flex-col items-center space-y-4">
                  <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
                    Wybierz kategorię
                  </label>

                  <select
                    id="category-select"
                    value={selectedCategory ?? ""}
                    onChange={handleCategoryChange}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    <option value="" disabled>
                      -- Wybierz kategorię --
                    </option>
                    {allCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.hobby_category_name}
                      </option>
                    ))}
                  </select>

                  {selectedCategoryName && (
                    <div className="text-md font-semibold text-gray-800">
                      Wybrana kategoria: <span className="text-blue-600">{selectedCategoryName}</span>
                    </div>
                  )}

                  {selectedHobby.length > 0 && (
                    <div className="mt-4 w-full max-w-2xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Hobby w tej kategorii:</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedHobby.map((hobby) => {
                          const userRating = getUserRatingForHobby(hobby.id);
                          return (
                            <div
                              key={hobby.id}
                              className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                            >
                              <h4 className="font-semibold text-gray-800">{hobby.hobby_name}</h4>
                              <p className="text-gray-600 text-sm mt-1 mb-3">{hobby.hobby_description}</p>

                              <div className="border-t pt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    {userRating ? "Twoja ocena:" : "Oceń to hobby:"}
                                  </span>
                                  {userRating && (
                                    <span className="text-sm font-bold text-blue-600">{userRating}/10</span>
                                  )}
                                </div>

                                <div className="flex items-center justify-center space-x-1 mb-2">
                                  {renderStars(userRating || 0, true, hobby.id)}
                                </div>

                                {userRating && (
                                  <button
                                    onClick={() => handleRemoveRating(hobby.id)}
                                    disabled={ratingsInProgress[hobby.id]}
                                    className="w-full mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {ratingsInProgress[hobby.id] ? "Usuwanie..." : "Usuń ocenę"}
                                  </button>
                                )}

                                {ratingsInProgress[hobby.id] && (
                                  <div className="text-center text-sm text-gray-500 mt-2">
                                    Przetwarzanie...
                                  </div>
                                )}

                                <div className="text-xs text-gray-500 mt-2 text-center">
                                  Kliknij na gwiazdkę, aby ocenić (1-10)
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </Background>
    </div>
  );
}
export default HobbyPage;