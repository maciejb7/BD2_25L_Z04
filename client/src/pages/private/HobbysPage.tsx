import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import { getAllHobby, getAllHobbyCategories, getHobbyByCategory, getUserHobbies } from "../../api/api.hobbys";
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

  // Funkcja do renderowania gwiazdek na podstawie oceny
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
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
    <div className="relative h-screen w-screen overflow-hidden">
      <Background blur="lg">
        <div className="flex h-full">
          <SideBar options={getSideBarOptions("Hobby")} />
          <main className="flex-1 overflow-y-auto px-4 py-6 space-y-10 ml-12 sm:ml-16">
            <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold text-gray-800 mb-6">
              <i className="fas fa-palette"></i>Twoje Hobby
            </h2>
            <hr className="my-6" />
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Twoje hobby</h2>

              {userHobbies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-gray-700">Ocena:</span>
                          <div className="flex">{renderStars(userHobby.rating)}</div>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{userHobby.rating}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-600 text-lg">
                    Nie masz jeszcze żadnych ocenionych hobby.
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Wybierz kategorię poniżej, aby przeglądać dostępne hobby i dodać swoje oceny.
                  </p>
                </div>
              )}
            </div>

            {/* Separator */}
            <hr className="border-gray-300 max-w-4xl mx-auto" />

            {/* Przeglądaj hobby */}
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
                      {selectedHobby.map((hobby) => (
                        <div
                          key={hobby.id}
                          className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
                        >
                          <h4 className="font-semibold text-gray-800">{hobby.hobby_name}</h4>
                          <p className="text-gray-600 text-sm mt-1">{hobby.hobby_description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </Background>
    </div>
  );
}
export default HobbyPage;