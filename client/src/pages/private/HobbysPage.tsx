import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef, use } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import { getUserHobbies, getAllHobby, getAllHobbyCategories } from "../../api/api.hobbys";
import { Hobby, Category } from "../../api/api.hobbys";

interface UserHobbyAnser {
  hobbyId: number;
  userId: number;
}

function HobbyPage() {

  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [userHobbies, setUserHobbies] = useState<Hobby[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { showAlert } = useAlert();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) {
      return; // Jeśli już zainicjowane, nie rób nic
    }
    initializationRef.current = true; // Oznacz jako zainicjowane

    const initializeUserHobbies = async () => {
      try {
        setIsLoading(true);
        const user = await getUser();
        if (!user) {
          throw new Error("Nie udało się pobrać ID użytkownika");
        }
        setUserId(user.userId);

        // const userHobbies = await getUserHobbies(user.userId);
        // if (!userHobbies) {
        //   throw new Error("Nie udało się pobrać hobby użytkownika");
        // }
        // setUserHobbies(userHobbies);

        const allHobbiesResponse = await getAllHobby();
        if (!allHobbiesResponse || allHobbiesResponse.length === 0) {
          throw new Error("Nie udało się pobrać wszystkich hobby");
        }
        setAllHobbies(allHobbiesResponse);

        const allCategoriesResponse = await getAllHobbyCategories();
        if (!allCategoriesResponse || allCategoriesResponse.length === 0) {
          throw new Error("Nie udało się pobrać wszystkich kategorii hobby");
        }
        setAllCategories(allCategoriesResponse); // Uwaga: też błąd w nazwie - powinno być setAllCategories
      }
      catch (error: any) {
        console.error("Błąd podczas inicjalizacji hobby użytkownika:", error);
        setError("Nie udało się pobrać hobby użytkownika. Spróbuj ponownie.");
        showAlert(`Nie udało się pobrać hobby użytkownika. Spróbuj ponownie. ${error.message}`, "error");
      }
      finally {
        setIsLoading(false);
      }
    };

    initializeUserHobbies();
  }, [showAlert]);

  if (allCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Hobby")} />
          <div className="ml-12 sm:ml-16">
            <p className="text-gray-700">Brak dostępnych kategorii hobby.</p>
          </div>
        </Background>
      </div>
    );
  }




  return (
    <div className="flex flex-col items-center justify-center">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Hobby")} />
        <div className="ml-12 sm:ml-16">
          <label
            htmlFor="category-select"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Wybierz kategorię
          </label>
          <select
            id="category-select"
            value={selectedCategory ?? ""}
            onChange={(e) => setSelectedCategory(Number(e.target.value))}
            className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
          >
            <option value="" disabled>
              -- Wybierz kategorię --
            </option>
            {allCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
      </Background>
    </div>
  );
}

export default HobbyPage;