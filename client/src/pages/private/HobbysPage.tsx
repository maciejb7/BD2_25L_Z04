import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";
import { useState, useEffect, useRef } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { getUser } from "../../utils/userAuthentication";
import { getAllHobby, getAllHobbyCategories, getHobbyByCategory } from "../../api/api.hobbys";
import { Hobby, Category } from "../../api/api.hobbys";

function HobbyPage() {
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [selectedHobby, setSelectedHobby] = useState<Hobby[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
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

        if (!hobbyRes?.length) throw new Error("Brak dostępnych hobby");
        if (!categoryRes?.length) throw new Error("Brak kategorii hobby");

        setAllHobbies(hobbyRes);
        setAllCategories(categoryRes);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen overflow-x-hidden">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Hobby")} />

        <div className="flex flex-col items-center justify-center w-full mt-8 space-y-6 px-4">
          <label
            htmlFor="category-select"
            className="text-sm font-medium text-gray-700"
          >
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
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {selectedHobby.map((hobby) => (
                  <li key={hobby.id}>
                    <strong>{hobby.hobby_name}</strong>: {hobby.hobby_description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Background>
    </div>
  );
}

export default HobbyPage;
